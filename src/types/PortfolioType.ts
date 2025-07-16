import { type Category, type Tag } from "./BlogType";

export interface Project {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  images: string[]; // 이미지 URL 배열
  summary: string[]; // 요약 포인트 배열
  status: "PLANNING" | "IN_PROGRESS" | "COMPLETED" | "PAUSED" | "ARCHIVED";
  categoryId: number | null;
  startDate: Date; // ISO 8601
  endDate: Date | null; // ISO 8601
  isPersonal: boolean;
  isActive: boolean;
  priority: number;
  createdAt: Date; // ISO 8601
  updatedAt: Date; // ISO 8601
  category?: Category;
  tags: Array<Tag>;
  techStack: Array<{ name: string }>;
  links: Array<{
    id: number;
    title: string; // "GitHub", "Demo", "Design" 등
    url: string;
    icon: string | null;
  }>;
}

export interface ProjectRequest {
  title: string;
  isPersonal?: boolean;
  startDate: Date;
  endDate?: Date;
  description: string;
  content: string;
  summary: string[];
  techStack: string[];
  githubLink?: string;
  projectLink?: string;
}
