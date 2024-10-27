import instance from "./axios";
import { Comment, CommentRequest } from "@/types/blogType";

interface CommentResponse {
  comments: Comment[];
  totalComments: number;
  parentComments: number;
}

export const getCommentList = async () => {
  const response = await instance.get<Comment[]>("/comments");
  return response.data;
};

export const getComments = async (postID: number, offset = 0, limit = 10) => {
  const response = await instance.get<CommentResponse>(`/comments/${postID}?offset=${offset}&limit=${limit}`);
  return response.data;
};

export const writeComment = async (body: CommentRequest) => {
  const response = await instance.post("/comments", body);
  return response.data;
};

export const editComment = async (id: number, content: string) => {
  const response = await instance.patch(`/comments/${id}`, { content });
  return response.data;
};

export const deleteComment = async (id: number) => {
  const response = await instance.delete(`/comments/${id}`);
  return response.data;
};

export const likeComment = async (id: number) => {
  const response = await instance.post(`/comments/${id}/like`);
  return response.data;
};
