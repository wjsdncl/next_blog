import getInstance from "./axios";
import TextSummarizer from "./TextSummarizer";
import { Project, ProjectRequest } from "@/types/PortfolioType";

const instance = getInstance();

export const getProjectList = async ({
  offset = 0,
  limit = 10,
}: {
  offset?: number;
  limit?: number;
}): Promise<{
  projects: Project[];
  isLast: boolean;
  nextPage: number;
}> => {
  const params = {
    offset,
    limit,
  };

  const response = await instance.get<Project[]>("/projects", { params });
  const projects = response.data;
  const isLast = projects.length < limit;

  return {
    projects,
    isLast,
    nextPage: offset + limit,
  };
};

export const getProject = async (id: number): Promise<Project> => {
  const response = await instance.get<Project>(`/projects/${id}`);
  return response.data;
};

export const createProject = async ({ projectData, userId }: { projectData: ProjectRequest; userId: string }) => {
  const summaries = await TextSummarizer(projectData.content);

  const response = await instance.post<Project>("/projects", { ...projectData, userId, summary: summaries });
  return response.data;
};

export const updateProject = async ({
  id,
  projectData,
  userId,
}: {
  id: number;
  projectData: ProjectRequest;
  userId: string;
}) => {
  let summaries = undefined;
  if (projectData.content) {
    summaries = await TextSummarizer(projectData.content);
  }
  const response = await instance.patch(`/projects/${id}`, {
    ...projectData,
    userId,
    ...(summaries && { summary: summaries }),
  });
  return response.data;
};

export const deleteProject = async (id: number): Promise<void> => {
  await instance.delete(`/projects/${id}`);
};
