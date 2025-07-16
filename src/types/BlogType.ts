export interface PostRequest {
  title: string;
  content: string;
  category?: string;
  tags: string[];
  isPrivate?: boolean;
}

export interface Post {
  id: number;
  thumbnail: string | null;
  categoryId: number | null;
  title: string;
  content: string;
  commentsCount: number;
  likesCount: number;
  views: number;
  createdAt: Date; // ISO 8601
  updatedAt: Date; // ISO 8601
  slug: string;
  choseongTitle: string; // 초성 제목
  isPrivate: boolean;
  category: {
    name: string;
    slug: string;
  } | null;
  tags: Array<{
    name: string;
    slug: string;
  }>;
}

export interface CategoryCounts {
  [category: string]: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  postsCount: number;
  projectsCount: number;
  totalCount: number;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  postsCount: number;
  projectsCount: number;
  totalCount: number;
}

export interface Comment {
  id: number;
  content: string;
  likesCount: number;
  isLiked: boolean;
  createdAt: Date; // ISO 8601
  updatedAt: Date; // ISO 8601
  userId: string;
  postId: number;
  parentCommentId: number | null;
  isEdited: boolean;
  user: {
    id: string;
    name: string;
  };
  replies: Array<Comment>;
}

export interface CommentRequest {
  content: string;
  userId?: string;
  postId: number;
  parentCommentId?: number;
}
