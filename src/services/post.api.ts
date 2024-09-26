import instance from "./axios";
import { CategoryCounts, Post, PostRequest } from "@/types/blogType";

export const getPostList = async ({
  pageParam = 0,
}): Promise<{
  posts: Post[];
  totalPosts: number;
  categoryCounts: CategoryCounts;
  isLast: boolean;
  nextPage: number;
}> => {
  const response = await instance.get<{ posts: Post[]; totalPosts: number; categoryCounts: CategoryCounts }>("/posts", {
    params: { offset: pageParam, limit: 10 }, // 페이지네이션 적용
  });

  const { posts, totalPosts, categoryCounts } = response.data;
  const isLast = posts.length < 10; // 10개 미만이면 마지막 페이지로 간주
  return { posts, totalPosts, isLast, nextPage: pageParam + 10, categoryCounts };
};

export const getPost = async (title: string) => {
  const response = await instance.get<Post>(`/posts/${title}`);
  return response.data;
};

export const writePost = async ({
  postData,
  coverImg = "",
  userId,
}: {
  postData: PostRequest;
  coverImg?: string;
  userId: string;
}) => {
  const response = await instance.post("/posts", { ...postData, coverImg, userId });
  return response.data;
};
