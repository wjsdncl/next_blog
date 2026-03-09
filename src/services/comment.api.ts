/* eslint-disable no-console */
import { type Comment, type CommentRequest } from "@/types/blogType";
import instance from "./instance";

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface CommentResponse {
  success: boolean;
  data: Comment[];
  pagination: Pagination;
}

export const COMMENT_KEYS = {
  all: () => ["comments"] as const,
  list: (postId: string, page: number, limit: number) => ["comments", postId, page, limit] as const,
};

export const getComments = async (postId: string, page = 1, limit = 10) => {
  try {
    const response = await instance.GET<CommentResponse>(
      `/comments?post_id=${postId}&page=${page}&limit=${limit}`
    );

    const { data: comments, pagination } = response;

    return {
      comments,
      totalCount: pagination.total,
    };
  } catch (error) {
    console.error(`게시글의 댓글 조회 실패 (게시글 ID: ${postId}):`, error);
    throw error;
  }
};

export const createComment = async (body: CommentRequest) => {
  try {
    return await instance.POST<{ success: boolean; data: Comment }>("/comments", body);
  } catch (error) {
    console.error("댓글 작성 실패:", error);
    throw error;
  }
};

export const updateComment = async (id: string, content: string) => {
  try {
    return await instance.PATCH<{ success: boolean; data: Comment }>(`/comments/${id}`, { content });
  } catch (error) {
    console.error(`댓글 수정 실패 (ID: ${id}):`, error);
    throw error;
  }
};

export const deleteComment = async (id: string) => {
  try {
    return await instance.DELETE<{ success: boolean }>(`/comments/${id}`);
  } catch (error) {
    console.error(`댓글 삭제 실패 (ID: ${id}):`, error);
    throw error;
  }
};

export const toggleCommentLike = async (id: string) => {
  try {
    return await instance.POST<{ success: boolean }>(`/comments/${id}/like`);
  } catch (error) {
    console.error(`댓글 좋아요 실패 (ID: ${id}):`, error);
    throw error;
  }
};
