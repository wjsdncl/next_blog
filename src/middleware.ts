/**
 * Next.js 미들웨어 — 인증 상태 기반 라우트 리다이렉션
 *
 * 로그인 상태: login/signup 접근 시 홈으로
 * 비로그인 상태: 인증 필요 페이지 접근 시 로그인으로
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** 로그인 상태에서 접근 차단할 경로 → 리다이렉트 대상 */
const authMap = new Map<RegExp, string>([[/^\/(login|signup)/, "/"]]);

/** 비로그인 상태에서 접근 차단할 경로 → 리다이렉트 대상 */
const guestMap = new Map<RegExp, string>([
  [/^\/(get-started|create-team|join-team)/, "/login"],
]);

export const middleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken");
  const map = accessToken ? authMap : guestMap;

  for (const [regex, redirectUrl] of map.entries()) {
    if (regex.test(pathname)) {
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }

  // API 경로는 미들웨어를 통과시킴
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  return NextResponse.next();
};

export const config = {
  // 다음과 같은 경로를 제외하고 모든 경로에 미들웨어를 적용합니다.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|icons).*)", "/api/:path*"],
};
