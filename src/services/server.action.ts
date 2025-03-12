/* eslint-disable no-console */
"use server";

import { revalidateTag } from "next/cache";

export async function revalidateProjectList() {
  console.log("프로젝트 목록 캐시 갱신");
  await revalidateTag("projects");
}

export async function revalidateCommentList() {
  console.log("댓글 목록 캐시 갱신");
  await revalidateTag("comments");
}

export async function revalidateUser() {
  console.log("사용자 정보 캐시 갱신");
  await revalidateTag("user");
}

export async function revalidatePostList() {
  console.log("게시글 목록 캐시 갱신");
  await revalidateTag("posts");
}
