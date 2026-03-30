/* eslint-disable no-console */
import { type Portfolio, type PortfolioListItem, type PortfolioRequest } from "@/types/portfolioType";
import instance from "./instance";

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface PortfolioResponse {
  success: boolean;
  data: PortfolioListItem[];
  pagination: Pagination;
}

interface TechStackItem {
  id: string;
  name: string;
  category: string | null;
}

export const getTechStackList = async (): Promise<TechStackItem[]> => {
  try {
    const res = await instance.GET<{ success: boolean; data: { items: TechStackItem[] } }>("/tech-stacks");
    return res.data.items;
  } catch (error) {
    console.error("기술 스택 목록 조회 실패:", error);
    return [];
  }
};

export const createTechStack = async (name: string): Promise<TechStackItem> => {
  const res = await instance.POST<{ success: boolean; data: TechStackItem }>("/tech-stacks", { name });
  return res.data;
};

export const resolveTechStackIds = async (names: string[]): Promise<string[]> => {
  if (names.length === 0) return [];

  const existingStacks = await getTechStackList();
  const ids: string[] = [];

  for (const name of names) {
    const existing = existingStacks.find((t) => t.name === name);
    if (existing) {
      ids.push(existing.id);
    } else {
      try {
        const created = await createTechStack(name);
        ids.push(created.id);
      } catch (error) {
        console.error(`기술 스택 생성 실패 (${name}):`, error);
      }
    }
  }

  return ids;
};

export const PORTFOLIO_KEYS = {
  all: () => ["portfolios"] as const,
  detail: (slug: string) => ["portfolios", "detail", slug] as const,
};

export const getPortfolioList = async ({
  page = 1,
  limit = 10,
}: {
  page?: number;
  limit?: number;
}): Promise<{
  portfolios: PortfolioListItem[];
  isLast: boolean;
  nextPage: number;
}> => {
  try {
    const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await instance.GET<PortfolioResponse>(`/portfolios?${searchParams.toString()}`, {
      next: {
        revalidate: 60 * 60,
        tags: [...PORTFOLIO_KEYS.all()],
      },
    });

    const portfolios = response.data;
    const isLast = !response.pagination.hasNext;

    return {
      portfolios,
      isLast,
      nextPage: page + 1,
    };
  } catch (error) {
    console.error("포트폴리오 목록 조회 실패:", error);
    throw error;
  }
};

export const getPortfolio = async (slug: string): Promise<Portfolio> => {
  try {
    const response = await instance.GET<{ success: boolean; data: Portfolio }>(`/portfolios/${slug}`);
    return response.data;
  } catch (error) {
    console.error(`포트폴리오 조회 실패 (slug: ${slug}):`, error);
    throw error;
  }
};

export const createPortfolio = async (portfolioData: PortfolioRequest) => {
  try {
    return await instance.POST<{ success: boolean; data: Portfolio }>("/portfolios", portfolioData);
  } catch (error) {
    console.error("포트폴리오 생성 실패:", error);
    throw error;
  }
};

export const updatePortfolio = async ({ id, portfolioData }: { id: string; portfolioData: Partial<PortfolioRequest> }) => {
  try {
    return await instance.PATCH<{ success: boolean; data: Portfolio }>(`/portfolios/${id}`, portfolioData);
  } catch (error) {
    console.error(`포트폴리오 수정 실패 (ID: ${id}):`, error);
    throw error;
  }
};

export const reorderPortfolios = async (items: { id: string; order: number }[]) => {
  try {
    return await instance.PATCH<{ success: boolean; message: string }>("/portfolios/reorder", { items });
  } catch (error) {
    console.error("포트폴리오 순서 변경 실패:", error);
    throw error;
  }
};

export const deletePortfolio = async (id: string) => {
  try {
    return await instance.DELETE<{ success: boolean }>(`/portfolios/${id}`);
  } catch (error) {
    console.error(`포트폴리오 삭제 실패 (ID: ${id}):`, error);
    throw error;
  }
};
