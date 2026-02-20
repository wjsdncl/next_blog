export type PublishStatus = "DRAFT" | "PUBLISHED" | "SCHEDULED";

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image: string | null;
  status: PublishStatus;
  view_count: number;
  like_count: number;
  comment_count: number;
  category_id: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  is_liked: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

export interface PostRequest {
  title: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  status?: PublishStatus;
  category?: string;
  tags: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  order: number;
  post_count: number;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryCounts {
  [category: string]: number;
}

export interface Comment {
  id: string;
  content: string;
  post_id: string;
  author_id: string;
  parent_id: string | null;
  like_count: number;
  is_liked: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  author: {
    id: string;
    username: string;
    role: string;
  };
  replies: Comment[];
}

export interface CommentRequest {
  content: string;
  post_id: string;
  parent_id?: string;
}
