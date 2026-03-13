/**
 * API 인스턴스 라우터
 *
 * SSR(서버): 백엔드 직접 호출 + cookies()로 토큰 전달
 * CSR(브라우저): /api 프록시 경유 (프록시가 쿠키→헤더 변환)
 */
import * as clientApi from "./client";
import * as serverApi from "./server";

const instance = typeof window === "undefined" ? serverApi : clientApi;
export default instance;
