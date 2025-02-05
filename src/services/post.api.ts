import { CategoryCounts, Post, PostRequest } from "@/types/BlogType";
import instance from "./axios";

export const getPostList = async ({
  offset = 0,
  limit = 10,
  order,
  search,
  category,
  tag,
}: {
  offset?: number;
  limit?: number;
  order?: "oldest" | "newest" | "like";
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
  const params: { offset: number; limit: number; order?: string; search?: string; category?: string; tag?: string } = {
    offset,
    limit: limit,
    order: order,
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
  const isLast = posts.length < limit;
  return { posts, totalPosts, isLast, nextPage: offset + limit, categoryCounts };
};

export const getPost = async (title: string) => {
  const response = await instance.get<Post>(`/posts/${title}`);
  return response.data;
};

export const deletePost = async (id: number) => {
  const response = await instance.delete(`/posts/${id}`);
  return response.data;
};

export const writePost = async ({ postData, userId }: { postData: PostRequest; userId: string }) => {
  const response = await instance.post("/posts", { ...postData, userId });
  return response.data;
};

export const updatePost = async ({
  id,
  postData,
  userId,
}: {
  id: number;
  postData: PostRequest;
  coverImg?: string;
  userId: string;
}) => {
  const response = await instance.patch(`/posts/${id}`, { ...postData, userId });
  return response.data;
};

export const likePost = async (id: number) => {
  const response = await instance.post(`/posts/${id}/like`);
  return response.data;
};

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await instance.post<{ url: string }>("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.url;
  } catch (error) {
    throw error;
  }
};
