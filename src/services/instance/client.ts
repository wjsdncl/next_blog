"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import cookies from "@/utils/cookies";
import { apiFetch } from "./common.api";

// 클라이언트에서 토큰 가져오기
const getClientTokens = () => {
  return {
    accessToken: cookies.get("accessToken"),
    refreshToken: cookies.get("refreshToken"),
  };
};

// 클라이언트 HTTP 메서드들
export async function GET<T = any>(url: string, options?: RequestInit): Promise<T> {
  const { accessToken, refreshToken } = getClientTokens();

  const _options: RequestInit = {
    ...options,
    method: "GET",
    headers: {
      ...options?.headers,
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...(refreshToken && { "X-Refresh-Token": refreshToken }),
    },
  };

  return apiFetch<T>({ url, options: _options });
}

export async function POST<T = any>(url: string, body?: object | FormData, options?: RequestInit): Promise<T> {
  const { accessToken, refreshToken } = getClientTokens();

  const isFormData = body instanceof FormData;

  const _options: RequestInit = {
    ...options,
    method: "POST",
    body: isFormData ? body : JSON.stringify(body),
    headers: {
      ...(!isFormData && { "Content-Type": "application/json" }),
      ...options?.headers,
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...(refreshToken && { "X-Refresh-Token": refreshToken }),
    },
  };

  return apiFetch<T>({ url, options: _options });
}

export async function PATCH<T = any>(url: string, body?: object, options?: RequestInit): Promise<T> {
  const { accessToken, refreshToken } = getClientTokens();

  const _options: RequestInit = {
    ...options,
    method: "PATCH",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...(refreshToken && { "X-Refresh-Token": refreshToken }),
    },
  };

  return apiFetch<T>({ url, options: _options });
}

export async function DELETE<T = any>(url: string, body?: object, options?: RequestInit): Promise<T> {
  const { accessToken, refreshToken } = getClientTokens();

  const _options: RequestInit = {
    ...options,
    method: "DELETE",
    ...(body && { body: JSON.stringify(body) }),
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...(refreshToken && { "X-Refresh-Token": refreshToken }),
    },
  };

  return apiFetch<T>({ url, options: _options });
}
