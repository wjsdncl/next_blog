"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import cookies from "@/utils/cookies";
import { clientApiFetch } from "./common.api";

const getClientTokens = () => {
  return {
    accessToken: cookies.get("accessToken"),
    refreshToken: cookies.get("refreshToken"),
  };
};

export async function GET<T = any>(url: string, options?: RequestInit): Promise<T> {
  const { accessToken, refreshToken } = getClientTokens();

  return clientApiFetch<T>({
    url,
    options: {
      ...options,
      method: "GET",
      headers: {
        ...options?.headers,
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        ...(refreshToken && { "X-Refresh-Token": refreshToken }),
      },
    },
  });
}

export async function POST<T = any>(url: string, body?: object | FormData, options?: RequestInit): Promise<T> {
  const { accessToken, refreshToken } = getClientTokens();
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
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        ...(refreshToken && { "X-Refresh-Token": refreshToken }),
      },
    },
  });
}

export async function PATCH<T = any>(url: string, body?: object, options?: RequestInit): Promise<T> {
  const { accessToken, refreshToken } = getClientTokens();

  return clientApiFetch<T>({
    url,
    options: {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        ...(refreshToken && { "X-Refresh-Token": refreshToken }),
      },
    },
  });
}

export async function DELETE<T = any>(url: string, body?: object, options?: RequestInit): Promise<T> {
  const { accessToken, refreshToken } = getClientTokens();

  return clientApiFetch<T>({
    url,
    options: {
      ...options,
      method: "DELETE",
      ...(body && { body: JSON.stringify(body) }),
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        ...(refreshToken && { "X-Refresh-Token": refreshToken }),
      },
    },
  });
}
