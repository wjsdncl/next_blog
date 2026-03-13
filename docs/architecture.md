# Frontend Architecture

## 라우팅 구조

| 경로                    | 설명                         | 렌더링          |
| ----------------------- | ---------------------------- | --------------- |
| `/`                     | 홈페이지                     | Server          |
| `/blog`                 | 게시글 목록 (무한 스크롤)    | Server + Client |
| `/blog/[title]`         | 게시글 상세 (slug)           | Server + Client |
| `/blog/write`           | 게시글 작성/수정 (OWNER)     | Client          |
| `/portfolio`            | 포트폴리오 목록              | Server + Client |
| `/portfolio/write`      | 포트폴리오 작성/수정 (OWNER) | Client          |
| `/about`                | 소개                         | Server          |
| `/contact`              | 연락처                       | Server          |
| `/sitemap`              | 사이트맵                     | Server          |
| `/(auth)/login`         | GitHub OAuth 로그인          | Client          |
| `/(auth)/signup`        | 회원가입                     | Client          |
| `/(auth)/auth/callback` | OAuth 콜백 처리              | Client          |
| `/(auth)/auth/error`    | OAuth 에러                   | Client          |
| `/api/[...path]`        | API 프록시 (백엔드 중계)     | Route Handler   |

## API 서비스 계층

### fetch 인스턴스 분기

```typescript
// services/instance/index.ts
// 환경에 따라 자동 분기 (단일 인스턴스)
const instance = typeof window === "undefined" ? serverApi : clientApi;
```

| 인스턴스       | 환경 | 대상                    | 쿠키                  |
| -------------- | ---- | ----------------------- | --------------------- |
| `clientApi`    | CSR  | `/api/[...path]` 프록시 | 자동 (브라우저)       |
| `serverApi`    | SSR  | `BACKEND_URL` 직접      | `cookies()` 헤더 전달 |

서비스 함수는 `instance`를 내부적으로 사용하며, 소비자(페이지 컴포넌트)는 인스턴스를 직접 다루지 않는다.

### Query Key Factory

```typescript
export const POST_KEYS = {
  all: () => ["posts"],
  list: (order, search?, category?, tag?) => ["posts", order, ...filters],
  detail: (slug) => ["posts", slug, "detail"],
  like: (id) => ["posts", id, "like"],
};
```

### 서비스 파일 구조

각 서비스 파일은 Query Key Factory + API 함수를 함께 관리한다.

```
services/
├── post.api.ts       → POST_KEYS + getPostList, getPost, createPost, ...
├── comment.api.ts    → COMMENT_KEYS + getComments, createComment, ...
├── auth.api.ts       → login, logout, getSession, refreshToken
├── portfolio.api.ts  → PORTFOLIO_KEYS + getPortfolios, ...
├── tag.api.ts        → TAG_KEYS + getTags, ...
└── user.api.ts       → getMe, updateProfile
```

## 상태 관리

### 서버 상태 (TanStack Query)

- API 데이터는 모두 TanStack Query로 관리
- 컴포넌트에서 직접 API 호출 금지 → 반드시 서비스 레이어 경유

### 클라이언트 상태 (Zustand)

| Store        | 용도                       |
| ------------ | -------------------------- |
| `ModalStore` | 모달 스택 관리 (열기/닫기) |
| `ToastStore` | 토스트 알림 (추가/제거)    |

## 컴포넌트 구조

### 페이지별 \_components

각 라우트 폴더 내 `_components/`에 해당 페이지 전용 컴포넌트를 배치한다.

```
app/blog/[title]/
├── page.tsx              → Server Component (데이터 fetch)
├── loading.tsx           → Skeleton UI
└── _components/
    ├── PostHeader.tsx    → 게시글 헤더
    ├── Comments/         → 댓글 시스템
    ├── GenerateTOC.tsx   → 목차 생성
    └── usePostActions.ts → 게시글 액션 훅
```

### 공유 컴포넌트

```
components/
├── layout/     → Header, Footer, Modal
├── providers/  → QueryProvider
├── ui/         → 범용 UI (Dropdown, Form, TagInput, Toggle)
├── feedback/   → 피드백 (Toast, LoadingOverlay)
└── content/    → 콘텐츠 렌더링 (MarkdownComponents, ImageCarousel)
```

## 인증 아키텍처

### 토큰 관리

| 쿠키            | HttpOnly | 용도                        |
| --------------- | -------- | --------------------------- |
| `access_token`  | O        | API 인증 (15분)             |
| `refresh_token` | O        | 토큰 갱신 (7일)             |
| `is_logged_in`  | X        | 클라이언트 로그인 상태 확인 |

### 토큰 갱신 경로

| 경로 | 위치                     | 트리거                                                 |
| ---- | ------------------------ | ------------------------------------------------------ |
| SSR  | `middleware.ts`          | 페이지 요청 시 access_token 없고 refresh_token 있을 때 |
| CSR  | `api/[...path]/route.ts` | API 프록시 호출 시 401 응답                            |

## 스타일링

- **Tailwind CSS** + CSS Variables (다크 모드)
- **다크 모드**: `darkMode: "selector"` (class 기반, next-themes)
- **폰트**: Pretendard Variable (로컬 woff2)
- **Typography**: `@tailwindcss/typography` 플러그인 (마크다운 렌더링)
- **브레이크포인트**: tablet: 768px, desktop: 1200px
