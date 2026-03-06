"use server";

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
