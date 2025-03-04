"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { cookies } from "next/headers";
import { apiFetch } from "./common.api";

// 서버에서 토큰 가져오기
const getServerTokens = () => {
  const accessToken = cookies().get("accessToken")?.value;
  const refreshToken = cookies().get("refreshToken")?.value;

  return {
    accessToken,
    refreshToken,
  };
};

// 각 HTTP 메서드를 별도의 async 함수로 내보내기
export async function GET<T = any>(url: string, options?: RequestInit): Promise<T> {
  const { accessToken, refreshToken } = getServerTokens();

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

export async function POST<T = any>(url: string, body?: object, options?: RequestInit): Promise<T> {
  const { accessToken, refreshToken } = getServerTokens();

  const _options: RequestInit = {
    ...options,
    method: "POST",
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

export async function PATCH<T = any>(url: string, body?: object, options?: RequestInit): Promise<T> {
  const { accessToken, refreshToken } = getServerTokens();

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
  const { accessToken, refreshToken } = getServerTokens();

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
