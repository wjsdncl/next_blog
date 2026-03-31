# Blog Frontend

Next.js 14 (App Router) 기반 블로그 프론트엔드.

## 기술 스택

- **Framework**: Next.js 14.2.30 (App Router)
- **Language**: TypeScript 5.8
- **Styling**: Tailwind CSS 3.4, next-themes (다크 모드)
- **Data Fetching**: TanStack Query 5.83
- **State Management**: Zustand 5.0
- **Form**: React Hook Form 7.60
- **Markdown**: react-markdown 9.1, remark-gfm, rehype-slug
- **AI**: @google/genai 1.44 (포트폴리오 요약)

## 로컬 개발

### 1. 패키지 설치

```bash
npm install
```

### 2. 환경변수

`.env.local` 파일을 생성:

```env
BACKEND_URL=http://localhost:8000
GEMINI_API_KEY=your-gemini-api-key
```

### 3. 실행

```bash
npm run dev       # localhost:3000
npm run build     # 프로덕션 빌드
npm run lint      # ESLint 검사
npm run format    # Prettier 포맷
```

## 프로젝트 구조

```
blog/src/
├── app/                      # Next.js App Router
│   ├── (auth)/               # 인증 (login, callback)
│   ├── (home)/               # 홈페이지
│   ├── blog/                 # 블로그 (목록, 상세, 작성)
│   ├── portfolio/            # 포트폴리오 (목록, 작성)
│   ├── about/, contact/      # 소개, 연락처
│   └── api/[...path]/        # API 프록시 (백엔드 중계)
├── components/               # 공유 UI 컴포넌트
│   ├── layout/               # Header, Footer, Modal
│   ├── ui/                   # Dropdown, Form, TagInput, Toggle
│   ├── feedback/             # Toaster, LoadingOverlay
│   └── content/              # MarkdownComponents, ImageCarousel
├── hooks/                    # 커스텀 훅
├── services/                 # API 서비스 레이어
│   ├── instance/             # fetch 인스턴스 (SSR/CSR 분기)
│   └── actions/              # Server Actions (revalidate, summarize)
├── stores/                   # Zustand 전역 상태
├── types/                    # TypeScript 타입 정의
├── utils/                    # 유틸리티 함수
├── Icons/                    # SVG 아이콘 (SVGR)
├── styles/                   # 글로벌 스타일
└── middleware.ts             # 인증 토큰 갱신 미들웨어
```

## 주요 아키텍처

### API 서비스 인스턴스 분기

```
SSR (서버 컴포넌트) → serverInstance → 백엔드 직접 호출 + cookies()
CSR (클라이언트)    → clientInstance → /api/[...path] 프록시 경유
```

### 인증 흐름

- 토큰은 HttpOnly 쿠키로 관리 (access_token, refresh_token)
- `is_logged_in` 쿠키로 클라이언트에서 로그인 상태 확인
- SSR: `middleware.ts`에서 토큰 자동 갱신
- CSR: `api/[...path]/route.ts` 프록시에서 토큰 자동 갱신

### 데이터 페칭

- TanStack Query + Query Key Factory 패턴
- 서버 컴포넌트에서 데이터 fetch → props로 클라이언트 컴포넌트에 전달
- `next: { revalidate }` 옵션으로 fetch-level 캐싱

## 문서

- [Architecture](docs/architecture.md) - 프론트엔드 아키텍처 문서
- [Troubleshooting](docs/troubleshooting.md) - 프론트엔드 트러블슈팅 기록
