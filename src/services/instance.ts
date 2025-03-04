/* eslint-disable @typescript-eslint/no-explicit-any */

// API 응답 에러를 다루기 위한 커스텀 에러 클래스
class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const apiFetch = async <T = any>({ url, options }: { url: string; options: RequestInit }): Promise<T> => {
  const baseUrl = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL;

  const endpoint = `${baseUrl}${url}`;
  const response = await fetch(endpoint, options);

  if (!response.ok) {
    // 서버에서 보낸 자세한 에러 메시지 추출 시도
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      // JSON 파싱 실패 시 기본 응답 사용
      throw new ApiError(response.statusText, response.status);
    }

    // 서버에서 제공한 에러 메시지 사용
    const errorMessage = errorData?.error || response.statusText;
    throw new ApiError(errorMessage, response.status, errorData);
  }

  return response.json();
};

const GET = <T = any>(url: string, options?: RequestInit): Promise<T> => {
  const _options: RequestInit = {
    ...options,
    method: "GET",
    credentials: "include",
    headers: {},
  };

  return apiFetch<T>({ url, options: _options });
};

const POST = <T = any>(url: string, body?: object, options?: RequestInit): Promise<T> => {
  const _options: RequestInit = {
    ...options,
    method: "POST",
    body: JSON.stringify(body),
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  };

  return apiFetch<T>({ url, options: _options });
};

const PATCH = <T = any>(url: string, body?: object, options?: RequestInit): Promise<T> => {
  const _options: RequestInit = {
    ...options,
    method: "PATCH",
    body: JSON.stringify(body),
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  };

  return apiFetch<T>({ url, options: _options });
};

const DELETE = <T = any>(url: string, body?: object, options?: RequestInit): Promise<T> => {
  const _options: RequestInit = {
    ...options,
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...(body && { body: JSON.stringify(body) }),
  };

  return apiFetch<T>({ url, options: _options });
};

const instance = {
  GET,
  POST,
  PATCH,
  DELETE,
};

export default instance;
