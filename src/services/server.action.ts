/* eslint-disable no-console */
"use server";

import { revalidateTag } from "next/cache";

export async function revalidateProjects() {
  console.log("프로젝트 목록 캐시 갱신");
  await revalidateTag("projects");
}

export async function revalidateUser() {
  console.log("사용자 정보 캐시 갱신");
  await revalidateTag("user");
}

export async function revalidatePosts() {
  console.log("게시글 목록 캐시 갱신");
  await revalidateTag("posts");
}
