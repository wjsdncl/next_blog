/**
 * 서버 사이드 API 인스턴스
 *
 * Next.js cookies()로 httpOnly 쿠키(access_token, refresh_token)를 읽어
 * Authorization / X-Refresh-Token 헤더로 변환하여 백엔드에 전달.
 * 토큰 갱신은 미들웨어에서 처리하므로 여기서는 읽기만 수행.
 */
"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { getTokens } from "@/utils/token";
import { serverApiFetch } from "./common.api";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const tokens = await getTokens();

  return {
    ...(tokens.accessToken && { Authorization: `Bearer ${tokens.accessToken}` }),
    ...(tokens.refreshToken && { "X-Refresh-Token": tokens.refreshToken }),
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
