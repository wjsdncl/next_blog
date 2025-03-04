/* eslint-disable no-console */
import { type Comment, type CommentRequest } from "@/types/BlogType";
import instance from "./instance";

interface CommentResponse {
  comments: Comment[];
  totalComments: number;
  parentComments: number;
}

export const getCommentList = async () => {
  try {
    return await instance.GET<Comment[]>("/comments");
  } catch (error) {
    console.error("댓글 전체 목록 조회 실패:", error);
    throw error;
  }
};

export const getComments = async (postID: number, offset = 0, limit = 10) => {
  try {
    return await instance.GET<CommentResponse>(`/comments/${postID}?offset=${offset}&limit=${limit}`);
  } catch (error) {
    console.error(`게시글의 댓글 조회 실패 (게시글 ID: ${postID}):`, error);
    throw error;
  }
};

export const writeComment = async (body: CommentRequest) => {
  try {
    return await instance.POST("/comments", body);
  } catch (error) {
    console.error("댓글 작성 실패:", error);
    throw error;
  }
};

export const editComment = async (id: number, content: string) => {
  try {
    return await instance.PATCH(`/comments/${id}`, { content });
  } catch (error) {
    console.error(`댓글 수정 실패 (ID: ${id}):`, error);
    throw error;
  }
};

export const deleteComment = async (id: number) => {
  try {
    return await instance.DELETE(`/comments/${id}`);
  } catch (error) {
    console.error(`댓글 삭제 실패 (ID: ${id}):`, error);
    throw error;
  }
};

export const likeComment = async (id: number) => {
  try {
    return await instance.POST(`/comments/${id}/like`);
  } catch (error) {
    console.error(`댓글 좋아요 실패 (ID: ${id}):`, error);
    throw error;
  }
};
