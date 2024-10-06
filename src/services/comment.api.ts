import instance from "./axios";
import { Comment, CommentRequest } from "@/types/blogType";

interface CommentResponse {
  comments: Comment[];
  totalComments: number;
}

export const getComments = async (title: string) => {
  const response = await instance.get<CommentResponse>(`/comments/${title}`);
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
