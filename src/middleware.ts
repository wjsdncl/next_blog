/**
 * Next.js 미들웨어 — 인증 상태 기반 라우트 리다이렉션 + 토큰 갱신
 *
 * 토큰 갱신: access_token 없고 refresh_token만 있을 때 백엔드에 갱신 요청
 * 로그인 상태: login/signup 접근 시 홈으로
 * 비로그인 상태: 인증 필요 페이지 접근 시 로그인으로
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { TOKEN_NAMES } from "@/utils/token";

const BACKEND_URL = process.env.BACKEND_URL || "https://api.wjdalswo.xyz";

/** 로그인 상태에서 접근 차단할 경로 → 리다이렉트 대상 */
const authMap = new Map<RegExp, string>([[/^\/(login|signup)/, "/"]]);

/** 비로그인 상태에서 접근 차단할 경로 → 리다이렉트 대상 */
const guestMap = new Map<RegExp, string>();

/** set-cookie 헤더에서 쿠키 값을 추출 */
function extractCookieValue(setCookieHeaders: string[], name: string): string | null {
  const header = setCookieHeaders.find((c) => c.startsWith(`${name}=`));
  if (!header) return null;
  return header.split("=")[1].split(";")[0];
}

/**
 * refresh_token으로 백엔드에 갱신 요청.
 * 성공 시 새 access_token과 refresh_token 값을 반환.
 */
async function refreshTokens(refreshToken: string): Promise<{ accessToken: string; newRefreshToken: string } | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `${TOKEN_NAMES.REFRESH}=${refreshToken}`,
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) return null;

    const setCookieHeaders = response.headers.getSetCookie();
    const accessToken = extractCookieValue(setCookieHeaders, TOKEN_NAMES.ACCESS);
    const newRefreshToken = extractCookieValue(setCookieHeaders, TOKEN_NAMES.REFRESH);

    if (!accessToken || !newRefreshToken) return null;

    return { accessToken, newRefreshToken };
  } catch {
    return null;
  }
}

export const middleware = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(TOKEN_NAMES.ACCESS);
  const refreshToken = request.cookies.get(TOKEN_NAMES.REFRESH);

  const isProduction = process.env.NODE_ENV === "production";
  const loggedInCookieOptions = {
    path: "/",
    httpOnly: false,
    ...(isProduction && { domain: ".wjdalswo.xyz" }),
  };

  // ── 토큰 갱신: access_token 없고 refresh_token만 있을 때 ──
  if (!accessToken && refreshToken) {
    const result = await refreshTokens(refreshToken.value);

    if (result) {
      // 요청 헤더에 새 access_token 주입 → 서버 컴포넌트에서 cookies()로 읽을 수 있도록
      const requestHeaders = new Headers(request.headers);
      const existing = request.headers.get("cookie") || "";
      requestHeaders.set("cookie", `${existing}; ${TOKEN_NAMES.ACCESS}=${result.accessToken}`);

      const response = NextResponse.next({ request: { headers: requestHeaders } });

      // 모든 쿠키를 cookies API로 통일 설정 (headers.append와 혼용 시 덮어쓰기 문제 방지)
      const tokenCookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax" as const,
        path: "/",
        ...(isProduction && { domain: ".wjdalswo.xyz" }),
      };

      response.cookies.set(TOKEN_NAMES.ACCESS, result.accessToken, {
        ...tokenCookieOptions,
        maxAge: 60 * 15,
      });

      response.cookies.set(TOKEN_NAMES.REFRESH, result.newRefreshToken, {
        ...tokenCookieOptions,
        maxAge: 60 * 60 * 24 * 7,
      });

      response.cookies.set(TOKEN_NAMES.LOGGED_IN, "true", loggedInCookieOptions);

      // 리다이렉트 체크 (갱신 성공 → 로그인 상태이므로 authMap 적용)
      for (const [regex, redirectUrl] of authMap.entries()) {
        if (regex.test(pathname)) {
          return NextResponse.redirect(new URL(redirectUrl, request.url));
        }
      }

      return response;
    }
  }

  // ── 기존 리다이렉트 로직 ──
  const isAuthenticated = !!accessToken || !!refreshToken;
  const map = isAuthenticated ? authMap : guestMap;

  for (const [regex, redirectUrl] of map.entries()) {
    if (regex.test(pathname)) {
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }

  const response = NextResponse.next();

  if (isAuthenticated) {
    response.cookies.set(TOKEN_NAMES.LOGGED_IN, "true", loggedInCookieOptions);
  } else {
    response.cookies.delete({ name: TOKEN_NAMES.LOGGED_IN, ...loggedInCookieOptions });
  }

  return response;
};

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|icons).*)", "/api/:path*"],
};
