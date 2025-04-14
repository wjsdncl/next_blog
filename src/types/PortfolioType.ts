export interface Project {
  id: number;
  title: string;
  isPersonal?: boolean;
  startDate: Date;
  endDate?: Date;
  description: string;
  images?: string[];
  content: string;
  summary: string[];
  techStack: string[];
  githubLink?: string;
  projectLink?: string;
  createdAt: Date;
  updatedAt: Date;
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
