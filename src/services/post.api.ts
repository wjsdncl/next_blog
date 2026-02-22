/* eslint-disable no-console */

import { type PostRequest, type Post } from "@/types/blogType";
import instance from "./instance";

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface PostResponse {
  success: boolean;
  data: Post[];
  pagination: Pagination;
}

export const CATEGORY_KEYS = {
  all: () => ["categories"] as const,
};

interface CategoriesResponse {
  success: boolean;
  data: Array<{ id: string; name: string; slug: string; post_count: number; order: number }>;
  totalPostCount: number;
}

export const getCategories = async (): Promise<{ categories: Record<string, number>; totalPosts: number }> => {
  try {
    const res = await instance.GET<CategoriesResponse>("/categories", {
      next: {
        revalidate: 60 * 30,
        tags: [...CATEGORY_KEYS.all()],
      },
    });

    const categories = res.data.reduce(
      (acc, cat) => {
        if (cat.post_count > 0) {
          acc[cat.slug] = cat.post_count;
        }
        return acc;
      },
      {} as Record<string, number>
    );

    return { categories, totalPosts: res.totalPostCount };
  } catch (error) {
    console.error("카테고리 목록 조회 실패:", error);
    return { categories: {}, totalPosts: 0 };
  }
};

export const POST_KEYS = {
  all: () => ["posts"] as const,
  list: (order: "oldest" | "newest" | "like" = "newest", search?: string, category?: string, tag?: string) => {
    const tags: string[] = ["posts", order];
    if (search) tags.push(search);
    if (category) tags.push(category);
    if (tag) tags.push(tag);
    return tags;
  },
  detail: (slug: string) => ["posts", slug, "detail"] as const,
  like: (id: string) => ["posts", id, "like"] as const,
};

export const getPostList = async ({
  page = 1,
  limit = 10,
  order = "newest",
  search,
  category,
  tag,
}: {
  page?: number;
  limit?: number;
  order?: "oldest" | "newest" | "like";
  search?: string;
  category?: string;
  tag?: string;
}) => {
  try {
    const params: Record<string, string> = {
      page: String(page),
      limit: String(limit),
      order,
    };

    if (search) params.search = search;
    if (category) params.category = category;
    if (tag) params.tag = tag;

    const searchParams = new URLSearchParams(params);
    const postRes = await instance.GET<PostResponse>(`/posts?${searchParams.toString()}`, {
      next: {
        revalidate: 60 * 30,
        tags: POST_KEYS.list(order, search, category, tag),
      },
    });

    const { data: posts, pagination } = postRes;
    const totalPosts = pagination.total;
    const isLast = !pagination.hasNext;

    return { posts, totalPosts, isLast, nextPage: page + 1 };
  } catch (error) {
    console.error("게시글 목록 조회 실패:", error);
    throw error;
  }
};

export const getPost = async (slug: string) => {
  try {
    const postRes = await instance.GET(`/posts/${slug}`, {
      next: {
        revalidate: 60 * 60,
        tags: [...POST_KEYS.detail(decodeURIComponent(slug))],
      },
    });

    const post: Post = postRes.data;
    return post;
  } catch (error) {
    console.error(`게시글 조회 실패 (${slug}):`, error);
    throw error;
  }
};

export const deletePost = async (id: string) => {
  try {
    return await instance.DELETE(`/posts/${id}`);
  } catch (error) {
    console.error(`게시글 삭제 실패 (ID: ${id}):`, error);
    throw error;
  }
};

export const createPost = async (postData: PostRequest) => {
  try {
    return await instance.POST("/posts", postData);
  } catch (error) {
    console.error("게시글 작성 실패:", error);
    throw error;
  }
};

export const updatePost = async ({ id, postData }: { id: string; postData: PostRequest }) => {
  try {
    return await instance.PATCH(`/posts/${id}`, postData);
  } catch (error) {
    console.error(`게시글 수정 실패 (ID: ${id}):`, error);
    throw error;
  }
};

export const likePost = async (id: string, signal: AbortSignal) => {
  try {
    return await instance.POST(`/posts/${id}/like`, undefined, { signal });
  } catch (error) {
    console.error(`게시글 좋아요 실패 (ID: ${id}):`, error);
    throw error;
  }
};

export const uploadImage = async (file: File): Promise<string> => {
  try {
    if (!file || !(file instanceof File)) {
      throw new Error("유효한 파일이 아닙니다.");
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("파일 크기가 10MB를 초과합니다.");
    }

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

    const response = await instance.POST<{ success: boolean; url: string }>("/upload", formData);

    if (!response || !response.success || !response.url) {
      throw new Error("서버 응답에 URL이 없습니다.");
    }

    return response.url;
  } catch (error) {
    console.error("이미지 업로드 실패:", error);
    if (error instanceof Error) {
      throw new Error(`이미지 업로드 실패: ${error.message}`);
    }
    throw error;
  }
};
