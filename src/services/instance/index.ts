import * as clientApi from "./client";
import * as serverApi from "./server";

// 환경에 따라 적절한 API 모듈 선택
const api = typeof window === "undefined" ? serverApi : clientApi;

// 개별 함수들 재내보내기
const GET = api.GET;
const POST = api.POST;
const PATCH = api.PATCH;
const DELETE = api.DELETE;

const instance = {
  GET,
  POST,
  PATCH,
  DELETE,
};

export default instance;
