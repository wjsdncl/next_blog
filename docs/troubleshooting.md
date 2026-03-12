# Troubleshooting

## 1. 새로고침 시 로그인 상태 깜빡임 (Flicker)

### 문제 상황

로그인 상태에서 페이지를 새로고침하면 "로그인" 버튼이 잠시 보였다가 "로그아웃" 버튼으로 바뀌는 깜빡임 현상이 발생했다.

- 원인: 클라이언트 훅(`useAuth`)이 마운트 후 `/me` API를 호출하여 사용자 정보를 가져오는 구조. SSR HTML에는 비로그인 UI가 포함되고, 클라이언트 hydration 후에야 로그인 UI로 전환됨.
- ISR(`revalidate`) 사용 중인 페이지에서는 `cookies()`를 사용할 수 없어 서버에서 user를 전달할 수 없는 구조적 제약이 있었다.

### 해결 방안

1. **ISR 제거**: 모든 페이지를 동적 렌더링으로 전환 (`export const revalidate` 삭제)
2. **`useAuth` 훅 삭제**: 클라이언트에서 user를 fetch하는 패턴 제거
3. **서버 컴포넌트에서 user 전달**: `getUser()`를 서버 컴포넌트에서 호출 → props로 클라이언트 컴포넌트에 전달
4. **`React.cache()`로 중복 제거**: 같은 요청 내 여러 서버 컴포넌트가 `getUser()`를 호출해도 1회만 실행

### 결과

- SSR HTML에 인증 상태가 포함되어 깜빡임 없음
- 클라이언트에서 불필요한 `/me` API 호출 제거
- fetch-level Data Cache(`next: { revalidate }`)는 유지하여 개별 API 응답 캐싱은 그대로 동작

---

## 2. access_token 만료 시 갱신 실패 (SSR 환경)

### 문제 상황

access_token이 만료(15분)된 후 페이지를 새로고침하면, refresh_token과 is_logged_in 쿠키만 남고 access_token이 갱신되지 않아 비로그인 상태로 표시되었다.

- 원인: `server.ts`의 `tryRefresh()` 함수가 `cookies().set()`을 호출하여 새 토큰을 쿠키에 저장하려 했으나, Next.js에서 `cookies().set()`은 **Server Action 또는 Route Handler**에서만 동작하고 **Server Component 렌더링 중에는 동작하지 않는다**.
- `server.ts`에 `"use server"` 지시문이 있지만, Server Component에서 직접 호출하면 Server Action 컨텍스트가 아닌 렌더링 컨텍스트에서 실행되어 `cookies().set()`이 실패한다.
- `try/catch`에 잡혀 `null`을 반환하면서 갱신이 무시되었다.

### 해결 방안

1. **토큰 갱신 로직을 미들웨어로 이동**: 미들웨어는 Server Component보다 먼저 실행되며, 응답 쿠키 설정과 요청 헤더 수정이 가능하다.
2. **`server.ts`에서 `tryRefresh()` 제거**: 토큰 읽기만 수행하도록 단순화.
3. 미들웨어에서 `!accessToken && refreshToken` 조건 시 백엔드 `/auth/refresh` 호출.
4. 갱신 성공 시:
   - 요청 헤더에 새 access_token 주입 → Server Component에서 `cookies()`로 읽을 수 있도록
   - `response.cookies.set()`으로 브라우저에 새 쿠키 전달

### 결과

- 미들웨어(SSR 경로)와 API 프록시(CSR 경로) 2곳으로 갱신 로직 정리
- Server Component에서 `cookies().set()` 호출하는 잘못된 패턴 제거
- access_token 만료 후에도 자동 갱신 정상 동작

---

## 3. 미들웨어 set-cookie 덮어쓰기 문제

### 문제 상황

미들웨어에서 토큰 갱신 후 `response.headers.append("set-cookie", ...)` 로 백엔드의 set-cookie를 전달하고, 이후 `response.cookies.set()`으로 `is_logged_in` 쿠키를 설정했더니 access_token과 refresh_token의 set-cookie가 유실되었다.

- 원인: Next.js의 `ResponseCookies.set()`은 내부 쿠키 맵을 `set-cookie` 헤더에 **전체 동기화(교체)**한다. `headers.append()`로 수동 추가한 set-cookie 헤더가 `cookies.set()` 호출 시 모두 덮어씌워진다.
- 결과적으로 브라우저에는 `is_logged_in=true`만 전달되고, 토큰 쿠키는 사라졌다.

### 해결 방안

`response.headers.append("set-cookie", ...)` 를 사용하지 않고, 백엔드의 set-cookie 헤더에서 토큰 값을 파싱한 뒤 모든 쿠키를 `response.cookies.set()` API로 통일하여 설정한다.

```typescript
// 모든 쿠키를 cookies.set()으로 통일
response.cookies.set(TOKEN_NAMES.ACCESS, result.accessToken, { ...options, maxAge: 60 * 15 });
response.cookies.set(TOKEN_NAMES.REFRESH, result.newRefreshToken, { ...options, maxAge: 60 * 60 * 24 * 7 });
response.cookies.set(TOKEN_NAMES.LOGGED_IN, "true", loggedInOptions);
```

### 결과

- `headers.append()`와 `cookies.set()` 혼용으로 인한 쿠키 유실 문제 해결
- 모든 쿠키가 `ResponseCookies` API를 통해 일관되게 관리됨

---

## 4. POST 요청 시 빈 body 전송 오류

### 문제 상황

백엔드의 `POST /auth/refresh` 등 일부 엔드포인트에서 body 파싱 오류가 발생했다.

- 원인: 프론트엔드의 fetch 인스턴스에서 POST 요청 시 body가 없으면 `undefined`가 전달되어 `Content-Type: application/json` 헤더는 설정되지만 실제 body가 비어있는 요청이 전송되었다.
- Fastify의 JSON 파서가 빈 body를 파싱하지 못해 오류 발생.

### 해결 방안

body가 없는 POST 요청에도 빈 객체 `{}` 를 `JSON.stringify()`하여 전송한다.

```typescript
body: isFormData ? body : JSON.stringify(body ?? {}),
```

### 결과

- 빈 body로 인한 파싱 오류 해결
- refresh, logout 등 body 없는 POST 요청이 정상 동작
