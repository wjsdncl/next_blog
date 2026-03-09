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
  cookies().delete("access_token");
  cookies().delete("refresh_token");
  await revalidateTag("user");
}
