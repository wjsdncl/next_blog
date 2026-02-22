"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { cookies } from "next/headers";
import { serverApiFetch } from "./common.api";

const getServerTokens = () => {
  const accessToken = cookies().get("accessToken")?.value;
  const refreshToken = cookies().get("refreshToken")?.value;
  return { accessToken, refreshToken };
};

export async function GET<T = any>(url: string, options?: RequestInit): Promise<T> {
  const { accessToken, refreshToken } = getServerTokens();

  return serverApiFetch<T>({
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

export async function POST<T = any>(url: string, body?: object, options?: RequestInit): Promise<T> {
  const { accessToken, refreshToken } = getServerTokens();
  const isFormData = body instanceof FormData;

  return serverApiFetch<T>({
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
  const { accessToken, refreshToken } = getServerTokens();

  return serverApiFetch<T>({
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
  const { accessToken, refreshToken } = getServerTokens();

  return serverApiFetch<T>({
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
