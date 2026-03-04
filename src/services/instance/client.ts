/**
 * 클라이언트 사이드 API 인스턴스
 *
 * /api 프록시를 경유하여 요청. 인증 헤더는 직접 설정하지 않음.
 * 프록시(app/api/[...path]/route.ts)가 httpOnly 쿠키를 읽어 헤더로 변환.
 */
"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { clientApiFetch } from "./common.api";

export async function GET<T = any>(url: string, options?: RequestInit): Promise<T> {
  return clientApiFetch<T>({
    url,
    options: {
      ...options,
      method: "GET",
      headers: {
        ...options?.headers,
      },
    },
  });
}

export async function POST<T = any>(url: string, body?: object | FormData, options?: RequestInit): Promise<T> {
  const isFormData = body instanceof FormData;

  return clientApiFetch<T>({
    url,
    options: {
      ...options,
      method: "POST",
      body: isFormData ? body : JSON.stringify(body),
      headers: {
        ...(!isFormData && { "Content-Type": "application/json" }),
        ...options?.headers,
      },
    },
  });
}

export async function PATCH<T = any>(url: string, body?: object, options?: RequestInit): Promise<T> {
  return clientApiFetch<T>({
    url,
    options: {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    },
  });
}

export async function DELETE<T = any>(url: string, body?: object, options?: RequestInit): Promise<T> {
  return clientApiFetch<T>({
    url,
    options: {
      ...options,
      method: "DELETE",
      ...(body && { body: JSON.stringify(body) }),
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    },
  });
}
