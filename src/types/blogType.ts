import { User } from "./authType";

export interface PostRequest {
  title: string;
  content: string;
  category?: string;
  tags: string[];
}

export interface Post {
  id: number;
  slug: string;
  coverImg?: string;
  category?: string;
  title: string;
  content?: string;
  tags: string[];
  likes: number;
  createdAt: Date;
  updatedAt: Date;

  user: User;
  userId: string;

  _count?: {
    comments: number;
    like: number;
  };

  isLiked: boolean;
}

export interface CategoryCounts {
  [category: string]: number;
}

export interface Comment {
  id: number;
  content: string;
  likes: number;
  createdAt: Date;
  updatedAt: Date;

  user: User;
  userId: string;

  post: Post;
  postId: number;

  parentComment?: Comment;
  parentCommentId?: number;

  replies?: Comment[];

  _count: {
    CommentLike: number;
  };
  isLiked: boolean;
}

export interface CommentRequest {
  content: string;
  userId?: string;
  postId: number;
  parentCommentId?: number;
}
