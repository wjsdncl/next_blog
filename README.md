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
- **AI**: @google/genai 1.44 (게시글 요약)

## 로컬 개발

### 1. 패키지 설치

```bash
npm install
```

### 2. 환경변수

`.env.local` 파일을 생성:

```env
BACKEND_URL=http://localhost:8000
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
blog/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── (auth)/           # 인증 관련 (login, signup, callback)
│   │   ├── (home)/           # 홈페이지
│   │   ├── blog/             # 블로그 (목록, 상세, 작성)
│   │   ├── portfolio/        # 포트폴리오 (목록, 작성)
│   │   ├── about/            # 소개 페이지
│   │   ├── contact/          # 연락처 페이지
│   │   ├── sitemap/          # 사이트맵
│   │   ├── api/[...path]/    # API 프록시 (백엔드 중계)
│   │   └── layout.tsx        # 루트 레이아웃
│   ├── components/           # 공유 UI 컴포넌트
│   │   ├── layout/           # Header, Footer, Modal
│   │   ├── providers/        # QueryProvider
│   │   ├── ui/               # Dropdown, Form, TagInput, Toggle
│   │   ├── feedback/         # Toast, LoadingOverlay
│   │   └── content/          # MarkdownComponents, ImageCarousel
│   ├── hooks/                # 커스텀 훅 (useDeviceSize, useFollowScroll)
│   ├── services/             # API 서비스 레이어
│   │   ├── instance/         # fetch 인스턴스 (SSR/CSR 분기)
│   │   ├── actions/          # Server Actions (revalidate, summarize)
│   │   ├── post.api.ts       # 게시글 API + Query Keys
│   │   ├── comment.api.ts    # 댓글 API
│   │   ├── auth.api.ts       # 인증 API
│   │   ├── portfolio.api.ts  # 포트폴리오 API
│   │   ├── tag.api.ts        # 태그 API
│   │   └── user.api.ts       # 사용자 API
│   ├── stores/               # Zustand (ModalStore, ToastStore)
│   ├── types/                # TypeScript 타입 정의
│   ├── utils/                # 유틸리티 (cn, token, formatDate, toast)
│   ├── Icons/                # SVG 아이콘 (SVGR)
│   ├── styles/               # globals.css
│   └── middleware.ts         # 인증 토큰 갱신 미들웨어
├── public/
│   ├── fonts/                # Pretendard 폰트
│   └── images/
└── docs/
    └── troubleshooting.md    # 트러블슈팅 기록
```

## 주요 아키텍처

### API 서비스 인스턴스 분기

```
SSR (서버 컴포넌트) → serverInstance → 백엔드 직접 호출 + cookies()
CSR (클라이언트)    → clientInstance → /api/[...path] 프록시 경유
ISR (정적 생성)     → publicInstance → 백엔드 직접 호출 (쿠키 없음)
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

- [Troubleshooting](docs/troubleshooting.md) - 프론트엔드 트러블슈팅 기록
