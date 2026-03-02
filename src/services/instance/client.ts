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
