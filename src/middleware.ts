import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 로그인 상태일 때 리디렉션 맵
const authMap = new Map<RegExp, string>([[/^\/(login|signup)/, "/"]]);

// 비로그인 상태일 때 리디렉션 맵
const guestMap = new Map<RegExp, string>([
  [/^\/(get-started|create-team|join-team)/, "/login"], // team 관련 경로
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

  return NextResponse.next();
};

export const config = {
  // 다음과 같은 경로를 제외하고 모든 경로에 미들웨어를 적용합니다.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|icons).*)"],
};
