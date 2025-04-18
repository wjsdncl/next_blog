"use server";

import { revalidateTag } from "next/cache";

export async function revalidateProjects() {
  await revalidateTag("projects");
}

export async function revalidateUser() {
  await revalidateTag("user");
}

export async function revalidatePosts() {
  await revalidateTag("posts");
}
