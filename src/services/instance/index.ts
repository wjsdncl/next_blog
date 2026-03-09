/**
 * API 인스턴스 라우터
 *
 * SSR(서버): 백엔드 직접 호출 + cookies()로 토큰 전달
 * CSR(브라우저): /api 프록시 경유 (프록시가 쿠키→헤더 변환)
 */
import * as clientApi from "./client";
import * as publicServerApi from "./publicServer";
import * as serverApi from "./server";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ReadonlyApiInstance {
  GET<T = any>(url: string, options?: RequestInit): Promise<T>;
}

// 인증 필요 데이터용 (cookies() 사용 → 동적 렌더링)
const instance = typeof window === "undefined" ? serverApi : clientApi;
export default instance;

// 공개 데이터용 (cookies() 미사용 → ISR 캐시 가능)
export const publicInstance: ReadonlyApiInstance = typeof window === "undefined" ? publicServerApi : clientApi;
