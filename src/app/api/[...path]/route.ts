/**
 * API 프록시 (Catch-all Route)
 *
 * 클라이언트 → /api/* → 백엔드로 프록시.
 * httpOnly 쿠키(access_token, refresh_token)를 읽어 Authorization 헤더로 변환.
 * 응답의 set-cookie는 append로 처리 (여러 쿠키 동시 전달).
 */
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "https://blog-api-xhk1.onrender.com";

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
    const cookieStore = cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    const refreshTokenCookie = cookieStore.get("refresh_token")?.value;

    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }
    if (refreshTokenCookie && !headers["X-Refresh-Token"]) {
      headers["X-Refresh-Token"] = refreshTokenCookie;
    }
  }

  return headers;
}

async function proxyRequest(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join("/");
  const queryString = request.nextUrl.search;
  const targetUrl = `${BACKEND_URL}/${path}${queryString}`;

  const authHeaders = getAuthHeaders(request);
  const contentType = request.headers.get("Content-Type");
  const isFormData = contentType?.includes("multipart/form-data");

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

  const responseHeaders = new Headers();
  response.headers.forEach((value, key) => {
    if (["transfer-encoding", "connection", "keep-alive"].includes(key.toLowerCase())) {
      return;
    }
    // set-cookie는 여러 개일 수 있으므로 append 사용
    if (key.toLowerCase() === "set-cookie") {
      responseHeaders.append(key, value);
    } else {
      responseHeaders.set(key, value);
    }
  });

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
