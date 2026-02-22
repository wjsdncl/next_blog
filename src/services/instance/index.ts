import * as clientApi from "./client";
import * as serverApi from "./server";

const instance = typeof window === "undefined" ? serverApi : clientApi;

export default instance;
