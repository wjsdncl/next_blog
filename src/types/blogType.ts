interface BlogType {
  id: number;
  coverImage?: string;
  category: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  comments: number;
  likes: number;
}

export default BlogType;
