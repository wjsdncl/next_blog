"use server";

import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { TOKEN_NAMES } from "@/utils/token";

export async function revalidatePortfolios() {
  await revalidateTag("portfolios");
}

export async function revalidateUser() {
  await revalidateTag("user");
}

export async function revalidatePosts() {
  await revalidateTag("posts");
}

/** httpOnly 쿠키는 클라이언트에서 삭제 불가하므로 서버 액션으로 처리 */
export async function logoutUser() {
  const cookieStore = cookies();
  const isProduction = process.env.NODE_ENV === "production";

  // 백엔드 cookieOptions(config/index.ts)와 동일한 조건으로 삭제해야 매칭됨
  const deleteOptions = {
    path: "/",
    ...(isProduction && { domain: ".wjdalswo.xyz" }),
  };

  cookieStore.delete({ name: TOKEN_NAMES.ACCESS, ...deleteOptions });
  cookieStore.delete({ name: TOKEN_NAMES.REFRESH, ...deleteOptions });
  cookieStore.delete({ name: TOKEN_NAMES.LOGGED_IN, ...deleteOptions });
  await revalidateTag("user");
}
