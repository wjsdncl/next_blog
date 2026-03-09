"use server";

import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";

export async function revalidatePortfolios() {
  await revalidateTag("portfolios");
}

export async function revalidateUser() {
  await revalidateTag("user");
}

export async function revalidatePosts() {
  await revalidateTag("posts");
}

export async function logoutUser() {
  const cookieStore = cookies();
  const isProduction = process.env.NODE_ENV === "production";

  const deleteOptions = {
    path: "/",
    ...(isProduction && { domain: ".wjdalswo.xyz" }),
  };

  cookieStore.delete({ name: "access_token", ...deleteOptions });
  cookieStore.delete({ name: "refresh_token", ...deleteOptions });
  await revalidateTag("user");
}
