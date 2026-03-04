/**
 * API 공통 모듈
 *
 * serverApiFetch: SSR에서 백엔드 직접 호출 (BACKEND_URL 환경변수)
 * clientApiFetch: CSR에서 /api 프록시 경유 (Next.js API Route)
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      throw new ApiError(response.statusText, response.status);
    }

    const errorMessage = errorData?.error || response.statusText;
    throw new ApiError(errorMessage, response.status, errorData);
  }

  return response.json();
}

export const serverApiFetch = async <T = any>({ url, options }: { url: string; options: RequestInit }): Promise<T> => {
  const backendUrl = process.env.BACKEND_URL || "https://api.wjdalswo.xyz";
  const response = await fetch(`${backendUrl}${url}`, options);
  return handleResponse<T>(response);
};

export const clientApiFetch = async <T = any>({ url, options }: { url: string; options: RequestInit }): Promise<T> => {
  const response = await fetch(`/api${url}`, options);
  return handleResponse<T>(response);
};
