import axios from "axios";
import removeMarkdown from "remove-markdown";
import getInstance from "./axios";
import { Project, ProjectRequest } from "@/types/PortfolioType";

const instance = getInstance();

export const getProjectList = async (): Promise<Project[]> => {
  const response = await instance.get<Project[]>("/projects");
  return response.data;
};

export const getProject = async (id: number): Promise<Project> => {
  const response = await instance.get<Project>(`/projects/${id}`);
  return response.data;
};

export const TextSummarizer = async (text: string) => {
  const content = removeMarkdown(text);

  const response = await axios.post<{ summary: string }>("/api/summarize", { text: content });
  const summaries = response.data.summary.split("\n");
  return summaries;
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
  const response = await instance.patch(`/projects/${id}`, { ...projectData, userId });
  return response.data;
};

export const deleteProject = async (id: number): Promise<void> => {
  await instance.delete(`/projects/${id}`);
};
