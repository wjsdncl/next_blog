/* eslint-disable no-console */
import { type ProjectResponse } from "@/app/api/projects/route";
import { type Project, type ProjectRequest } from "@/types/PortfolioType";
import instance from "./instance";
import TextSummarizer from "./TextSummarizer";

export const PROJECT_TAG = {
  ALL: () => ["projects"],
  DETAIL: (id: number) => ["projects", id],
};

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
  try {
    const searchParams = new URLSearchParams({
      offset: offset.toString(),
      limit: limit.toString(),
    });

    const response = await instance.GET<ProjectResponse>(`/projects?${searchParams.toString()}`, {
      next: {
        revalidate: 60 * 60, // 1시간
        tags: PROJECT_TAG.ALL(),
      },
    });

    const projects = response.data;
    const isLast = response.meta.pagination.total <= offset + limit;

    return {
      projects,
      isLast,
      nextPage: offset + limit,
    };
  } catch (error) {
    console.error("프로젝트 목록 조회 실패:", error);
    throw error;
  }
};

export const getProject = async (id: number): Promise<Project> => {
  try {
    return await instance.GET<Project>(`/projects/${id}`);
  } catch (error) {
    console.error(`프로젝트 조회 실패 (ID: ${id}):`, error);
    throw error;
  }
};

export const createProject = async ({
  projectData,
  userId,
  generateSummary = true,
}: {
  projectData: ProjectRequest;
  userId: string;
  generateSummary?: boolean;
}) => {
  try {
    let summaries;
    if (generateSummary) {
      summaries = await TextSummarizer(projectData.content);
    }

    return await instance.POST<Project>("/projects", {
      ...projectData,
      userId,
      summary: summaries,
    });
  } catch (error) {
    console.error("프로젝트 생성 실패:", error);
    throw error;
  }
};

export const updateProject = async ({
  id,
  projectData,
  generateSummary = true,
}: {
  id: number;
  projectData: ProjectRequest;
  generateSummary?: boolean;
}) => {
  try {
    let summaries = undefined;
    if (generateSummary) {
      summaries = await TextSummarizer(projectData.content);
    }

    return await instance.PATCH(`/projects/${id}`, {
      ...projectData,
      ...(summaries && { summary: summaries }),
    });
  } catch (error) {
    console.error(`프로젝트 수정 실패 (ID: ${id}):`, error);
    throw error;
  }
};

export const deleteProject = async (id: number): Promise<void> => {
  try {
    return await instance.DELETE(`/projects/${id}`);
  } catch (error) {
    console.error(`프로젝트 삭제 실패 (ID: ${id}):`, error);
    throw error;
  }
};
