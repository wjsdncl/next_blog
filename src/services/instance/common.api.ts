/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Tokens {
  accessToken?: string | null;
  refreshToken?: string | null;
}

// API 응답 에러를 다루기 위한 커스텀 에러 클래스
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

export const apiFetch = async <T = any>({ url, options }: { url: string; options: RequestInit }): Promise<T> => {
  // 내부 API Routes 사용 (프록시를 통해 백엔드로 전달)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const endpoint = `${baseUrl}/api${url}`;
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
