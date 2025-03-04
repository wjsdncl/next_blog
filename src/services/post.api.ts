import { type CategoryCounts, type Post, type PostRequest } from "@/types/BlogType";
import instance from "./instance";

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
  try {
    /* eslint-disable no-console */
    const params: { offset: number; limit: number; order?: string; search?: string; category?: string; tag?: string } =
      {
        offset,
        limit: limit,
        order: order,
      };

    if (search) params.search = search;
    if (category) params.category = category;
    if (tag) params.tag = tag;

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, String(value));
    });
    const response = await instance.GET<{
      posts: Post[];
      totalPosts: number;
      categoryCounts: CategoryCounts;
    }>(`/posts?${searchParams.toString()}`);

    const { posts, totalPosts, categoryCounts } = response;
    const isLast = posts.length < limit;
    return { posts, totalPosts, isLast, nextPage: offset + limit, categoryCounts };
  } catch (error) {
    console.error("게시글 목록 조회 실패:", error);
    throw error;
  }
};

export const getPost = async (title: string) => {
  try {
    return await instance.GET<Post>(`/posts/${title}`);
  } catch (error) {
    console.error(`게시글 조회 실패 (${title}):`, error);
    throw error;
  }
};

export const deletePost = async (id: number) => {
  try {
    return await instance.DELETE(`/posts/${id}`);
  } catch (error) {
    console.error(`게시글 삭제 실패 (ID: ${id}):`, error);
    throw error;
  }
};

export const writePost = async ({ postData, userId }: { postData: PostRequest; userId: string }) => {
  try {
    return await instance.POST("/posts", { ...postData, userId });
  } catch (error) {
    console.error("게시글 작성 실패:", error);
    throw error;
  }
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
  try {
    return await instance.PATCH(`/posts/${id}`, { ...postData, userId });
  } catch (error) {
    console.error(`게시글 수정 실패 (ID: ${id}):`, error);
    throw error;
  }
};

export const likePost = async (id: number) => {
  try {
    return await instance.POST(`/posts/${id}/like`);
  } catch (error) {
    console.error(`게시글 좋아요 실패 (ID: ${id}):`, error);
    throw error;
  }
};

export const uploadImage = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await instance.POST<{ url: string }>("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.url;
  } catch (error) {
    console.error("이미지 업로드 실패:", error);
    throw error;
  }
};
