/* eslint-disable no-console */

import { type PostResponse } from "@/app/api/posts/route";
import { type PostRequest, type Post } from "@/types/BlogType";
import instance from "./instance";

export const POST_TAG = {
  ALL: () => ["posts"],
  TITLE: (title: string) => ["posts", title, "detail"],
  LIST: (order: "oldest" | "newest" | "like" = "newest", search?: string, category?: string, tag?: string) => {
    const tags = ["posts", order];
    if (search) tags.push(search);
    if (category) tags.push(category);
    if (tag) tags.push(tag);
    return tags;
  },
  LIKE: (id: number) => ["posts", id, "like"],
};

export const getPostList = async ({
  offset = 0,
  limit = 10,
  order = "newest",
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
}) => {
  try {
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
    const postRes = await instance.GET<PostResponse>(`/posts?${searchParams.toString()}`, {
      next: {
        revalidate: 60 * 30, // 30분
        tags: POST_TAG.LIST(order, search, category, tag),
      },
    });

    const { data: posts, categories, meta } = postRes;
    const totalPosts = meta.pagination.total;
    const isLast = posts.length < limit;
    const c = categories.reduce(
      // eslint-disable-next-line @typescript-eslint/no-shadow
      (acc, category) => {
        if (category.postsCount && category.postsCount > 0) {
          acc[category.slug] = category.postsCount;
        }
        return acc;
      },
      {} as Record<string, number>
    );

    return { posts, totalPosts, isLast, nextPage: offset + limit, categories: c };
  } catch (error) {
    console.error("게시글 목록 조회 실패:", error);
    throw error;
  }
};

export const getPost = async (title: string) => {
  try {
    const postRes = await instance.GET(`/posts/title/${title}`, {
      next: {
        revalidate: 60 * 60, // 1시간
        tags: POST_TAG.TITLE(decodeURIComponent(title)),
      },
    });

    const post: Post = postRes.data;
    return post;
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
  thumbnail?: string;
  userId: string;
}) => {
  try {
    return await instance.PATCH(`/posts/${id}`, { ...postData, userId });
  } catch (error) {
    console.error(`게시글 수정 실패 (ID: ${id}):`, error);
    throw error;
  }
};

export const likePost = async (id: number, signal: AbortSignal) => {
  try {
    return await instance.POST(`/posts/${id}/like`, undefined, { signal });
  } catch (error) {
    console.error(`게시글 좋아요 실패 (ID: ${id}):`, error);
    throw error;
  }
};

export const uploadImage = async (file: File): Promise<string> => {
  try {
    // 파일 유효성 검사
    if (!file || !(file instanceof File)) {
      throw new Error("유효한 파일이 아닙니다.");
    }

    // 파일 크기 제한 (예: 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("파일 크기가 10MB를 초과합니다.");
    }

    // 이미지 파일 타입 확인
    const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validImageTypes.includes(file.type)) {
      throw new Error("지원되지 않는 이미지 형식입니다. (JPEG, PNG, GIF, WEBP만 허용)");
    }

    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop() || "";
    const safeFileName = `image-${timestamp}.${fileExtension}`;

    const renamedFile = new File([file], safeFileName, { type: file.type });

    const formData = new FormData();
    formData.append("file", renamedFile);

    formData.append("fileType", file.type);

    // 백엔드 응답 형식에 맞게 타입 정의
    const response = await instance.POST<{ success: boolean; url: string }>("/upload", formData);

    if (!response || !response.success || !response.url) {
      throw new Error("서버 응답에 URL이 없습니다.");
    }

    return response.url;
  } catch (error) {
    console.error("이미지 업로드 실패:", error);
    // 더 상세한 오류 메시지 제공
    if (error instanceof Error) {
      throw new Error(`이미지 업로드 실패: ${error.message}`);
    }
    throw error;
  }
};
