/**
 * 서버 사이드 API 인스턴스
 *
 * Next.js cookies()로 httpOnly 쿠키(access_token, refresh_token)를 읽어
 * Authorization / X-Refresh-Token 헤더로 변환하여 백엔드에 전달.
 * access_token 만료 시 refresh_token으로 자동 갱신.
 */
"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { cookies } from "next/headers";
import { getTokens, TOKEN_NAMES } from "@/utils/token";
import { serverApiFetch } from "./common.api";

const BACKEND_URL = process.env.BACKEND_URL || "https://api.wjdalswo.xyz";

/**
 * access_token이 없고 refresh_token만 있을 때 토큰 갱신.
 * 갱신된 access_token을 반환.
 */
async function tryRefresh(refreshToken: string): Promise<string | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `refresh_token=${refreshToken}`,
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) return null;

    // set-cookie에서 새 토큰 추출 후 Next.js 쿠키에 반영
    const cookieStore = cookies();
    const setCookieHeaders = response.headers.getSetCookie();

    for (const setCookie of setCookieHeaders) {
      const [nameValue] = setCookie.split(";");
      const [name, ...rest] = nameValue.split("=");
      const cookieValue = rest.join("=");

      if (name === TOKEN_NAMES.ACCESS || name === TOKEN_NAMES.REFRESH) {
        const maxAge = name === TOKEN_NAMES.ACCESS ? 60 * 15 : 60 * 60 * 24 * 7;
        cookieStore.set(name, cookieValue, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge,
        });
      }
    }

    const newAccessToken = cookieStore.get(TOKEN_NAMES.ACCESS)?.value;
    return newAccessToken || null;
  } catch {
    return null;
  }
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const tokens = await getTokens();
  let accessToken = tokens.accessToken;
  const refreshToken = tokens.refreshToken;

  // access_token 없고 refresh_token만 있으면 갱신 시도
  if (!accessToken && refreshToken) {
    accessToken = (await tryRefresh(refreshToken)) || undefined;
  }

  return {
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    ...(refreshToken && { "X-Refresh-Token": refreshToken }),
  };
}

export async function GET<T = any>(url: string, options?: RequestInit): Promise<T> {
  const authHeaders = await getAuthHeaders();

  return serverApiFetch<T>({
    url,
    options: {
      ...options,
      method: "GET",
      headers: {
        ...options?.headers,
        ...authHeaders,
      },
    },
  });
}

export async function POST<T = any>(url: string, body?: object, options?: RequestInit): Promise<T> {
  const authHeaders = await getAuthHeaders();
  const isFormData = body instanceof FormData;

  return serverApiFetch<T>({
    url,
    options: {
      ...options,
      method: "POST",
      body: isFormData ? body : JSON.stringify(body ?? {}),
      headers: {
        ...(!isFormData && { "Content-Type": "application/json" }),
        ...options?.headers,
        ...authHeaders,
      },
    },
  });
}

export async function PATCH<T = any>(url: string, body?: object, options?: RequestInit): Promise<T> {
  const authHeaders = await getAuthHeaders();

  return serverApiFetch<T>({
    url,
    options: {
      ...options,
      method: "PATCH",
      ...(body !== undefined && { body: JSON.stringify(body) }),
      headers: {
        ...(body !== undefined && { "Content-Type": "application/json" }),
        ...options?.headers,
        ...authHeaders,
      },
    },
  });
}

export async function DELETE<T = any>(url: string, body?: object, options?: RequestInit): Promise<T> {
  const authHeaders = await getAuthHeaders();

  return serverApiFetch<T>({
    url,
    options: {
      ...options,
      method: "DELETE",
      ...(body && { body: JSON.stringify(body) }),
      headers: {
        ...(body && { "Content-Type": "application/json" }),
        ...options?.headers,
        ...authHeaders,
      },
    },
  });
}
