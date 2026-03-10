/**
 * API 프록시 (Catch-all Route)
 *
 * 클라이언트 → /api/* → 백엔드로 프록시.
 * httpOnly 쿠키(access_token, refresh_token)를 읽어 Authorization 헤더로 변환.
 * access_token 만료 시 refresh_token으로 자동 갱신 후 재시도.
 * 응답의 set-cookie는 append로 처리 (여러 쿠키 동시 전달).
 */
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "https://blog-api-xhk1.onrender.com";

function getTokensFromCookies(): { accessToken?: string; refreshToken?: string } {
  const cookieStore = cookies();
  return {
    accessToken: cookieStore.get("access_token")?.value,
    refreshToken: cookieStore.get("refresh_token")?.value,
  };
}

function getAuthHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {};

  // 1. 클라이언트가 보낸 헤더 우선
  const authorization = request.headers.get("Authorization");
  const refreshToken = request.headers.get("X-Refresh-Token");

  if (authorization) {
    headers["Authorization"] = authorization;
  }
  if (refreshToken) {
    headers["X-Refresh-Token"] = refreshToken;
  }

  // 2. 헤더가 없으면 httpOnly 쿠키에서 읽어서 변환
  if (!headers["Authorization"]) {
    const tokens = getTokensFromCookies();

    if (tokens.accessToken) {
      headers["Authorization"] = `Bearer ${tokens.accessToken}`;
    }
    if (tokens.refreshToken && !headers["X-Refresh-Token"]) {
      headers["X-Refresh-Token"] = tokens.refreshToken;
    }
  }

  return headers;
}

/**
 * access_token이 없고 refresh_token만 있을 때
 * POST /auth/refresh를 호출하여 새 토큰을 발급받는다.
 * 성공 시 응답의 set-cookie에서 새 access_token을 추출하여 반환.
 */
async function tryRefreshTokens(refreshToken: string): Promise<{
  accessToken: string;
  setCookieHeaders: string[];
} | null> {
  const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `refresh_token=${refreshToken}`,
    },
  });

  if (!response.ok) return null;

  const setCookieHeaders: string[] = [];
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      setCookieHeaders.push(value);
    }
  });

  // set-cookie에서 새 access_token 추출
  const accessTokenCookie = setCookieHeaders.find((c) => c.startsWith("access_token="));
  if (!accessTokenCookie) return null;

  const accessToken = accessTokenCookie.split("=")[1].split(";")[0];
  return { accessToken, setCookieHeaders };
}

function buildResponseHeaders(response: Response, extraSetCookies?: string[]): Headers {
  const responseHeaders = new Headers();

  response.headers.forEach((value, key) => {
    if (["transfer-encoding", "connection", "keep-alive"].includes(key.toLowerCase())) {
      return;
    }
    if (key.toLowerCase() === "set-cookie") {
      responseHeaders.append(key, value);
    } else {
      responseHeaders.set(key, value);
    }
  });

  // refresh로 받은 set-cookie도 클라이언트에 전달
  if (extraSetCookies) {
    for (const cookie of extraSetCookies) {
      responseHeaders.append("set-cookie", cookie);
    }
  }

  return responseHeaders;
}

async function proxyRequest(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join("/");
  const queryString = request.nextUrl.search;
  const targetUrl = `${BACKEND_URL}/${path}${queryString}`;

  const authHeaders = getAuthHeaders(request);
  const contentType = request.headers.get("Content-Type");
  const isFormData = contentType?.includes("multipart/form-data");

  // access_token 없고 refresh_token만 있으면 갱신 시도
  let refreshSetCookies: string[] | undefined;
  if (!authHeaders["Authorization"]) {
    const tokens = getTokensFromCookies();
    if (tokens.refreshToken) {
      const refreshResult = await tryRefreshTokens(tokens.refreshToken);
      if (refreshResult) {
        authHeaders["Authorization"] = `Bearer ${refreshResult.accessToken}`;
        refreshSetCookies = refreshResult.setCookieHeaders;
      }
    }
  }

  const headers: Record<string, string> = { ...authHeaders };
  if (contentType && !isFormData) {
    headers["Content-Type"] = contentType;
  }

  const fetchOptions: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    fetchOptions.body = isFormData ? await request.arrayBuffer() : await request.text();
    if (isFormData && contentType) {
      headers["Content-Type"] = contentType;
    }
  }

  const response = await fetch(targetUrl, fetchOptions);

  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get("Location");
    if (location) {
      return NextResponse.redirect(location, response.status);
    }
  }

  const responseHeaders = buildResponseHeaders(response, refreshSetCookies);
  const body = await response.arrayBuffer();

  return new NextResponse(body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
export const PUT = proxyRequest;
