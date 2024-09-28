import instance from "./axios";
import { CategoryCounts, Post, PostRequest } from "@/types/blogType";

export const getPostList = async ({
  pageParam = 0,
  search,
  category,
  tag,
}: {
  pageParam?: number;
  search?: string;
  category?: string;
  tag?: string;
}): Promise<{
  posts: Post[];
  totalPosts: number;
  categoryCounts: CategoryCounts;
  isLast: boolean;
  nextPage: number;
}> => {
  const params: { offset: number; limit: number; search?: string; category?: string; tag?: string } = {
    offset: pageParam,
    limit: 10,
  };

  if (search) params.search = search;
  if (category) params.category = category;
  if (tag) params.tag = tag;

  const response = await instance.get<{
    posts: Post[];
    totalPosts: number;
    categoryCounts: CategoryCounts;
  }>("/posts", { params });

  const { posts, totalPosts, categoryCounts } = response.data;
  const isLast = posts.length < 10;
  return { posts, totalPosts, isLast, nextPage: pageParam + 10, categoryCounts };
};

export const getPost = async (title: string) => {
  const response = await instance.get<Post>(`/posts/${title}`);
  return response.data;
};

export const deletePost = async (id: number) => {
  const response = await instance.delete(`/posts/${id}`);
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

export const updatePost = async ({
  id,
  postData,
  coverImg = "",
  userId,
}: {
  id: number;
  postData: PostRequest;
  coverImg?: string;
  userId: string;
}) => {
  const response = await instance.patch(`/posts/${id}`, { ...postData, coverImg, userId });
  return response.data;
};
