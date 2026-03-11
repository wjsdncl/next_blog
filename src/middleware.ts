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
const guestMap = new Map<RegExp, string>();

export const middleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("access_token");
  const refreshToken = request.cookies.get("refresh_token");

  // access_token 또는 refresh_token 중 하나라도 있으면 인증 상태로 판단
  // (refresh_token만 있으면 프록시/SSR에서 자동 갱신됨)
  const isAuthenticated = !!accessToken || !!refreshToken;
  const map = isAuthenticated ? authMap : guestMap;

  for (const [regex, redirectUrl] of map.entries()) {
    if (regex.test(pathname)) {
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }

  const response = NextResponse.next();

  // 인증 상태를 non-httpOnly 쿠키로 미러링
  // → 클라이언트에서 /me 호출 여부를 판단하는 플래그
  const isProduction = process.env.NODE_ENV === "production";
  const cookieOptions = {
    path: "/",
    httpOnly: false,
    ...(isProduction && { domain: ".wjdalswo.xyz" }),
  };

  if (isAuthenticated) {
    response.cookies.set("is_logged_in", "true", cookieOptions);
  } else {
    response.cookies.delete({ name: "is_logged_in", ...cookieOptions });
  }

  return response;
};

export const config = {
  // 다음과 같은 경로를 제외하고 모든 경로에 미들웨어를 적용합니다.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|icons).*)", "/api/:path*"],
};
