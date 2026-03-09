/**
 * 공개 데이터용 서버 사이드 API 인스턴스
 *
 * cookies() 미사용 → ISR 캐시 가능
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { serverApiFetch } from "./common.api";

export async function GET<T = any>(url: string, options?: RequestInit): Promise<T> {
  return serverApiFetch<T>({
    url,
    options: { ...options, method: "GET" },
  });
}
