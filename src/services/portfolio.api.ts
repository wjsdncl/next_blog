/* eslint-disable no-console */
import { type PortfolioResponse } from "@/app/api/portfolios/route";
import { type Portfolio, type PortfolioRequest } from "@/types/portfolioType";
import instance from "./instance";

export const PORTFOLIO_KEYS = {
  all: () => ["portfolios"] as const,
  detail: (id: string) => ["portfolios", id] as const,
};

export const getPortfolioList = async ({
  page = 1,
  limit = 10,
}: {
  page?: number;
  limit?: number;
}): Promise<{
  portfolios: Portfolio[];
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

export const getPortfolio = async (id: string): Promise<Portfolio> => {
  try {
    return await instance.GET<Portfolio>(`/portfolios/${id}`);
  } catch (error) {
    console.error(`포트폴리오 조회 실패 (ID: ${id}):`, error);
    throw error;
  }
};

export const createPortfolio = async (portfolioData: PortfolioRequest) => {
  try {
    return await instance.POST<Portfolio>("/portfolios", portfolioData);
  } catch (error) {
    console.error("포트폴리오 생성 실패:", error);
    throw error;
  }
};

export const updatePortfolio = async ({ id, portfolioData }: { id: string; portfolioData: PortfolioRequest }) => {
  try {
    return await instance.PATCH(`/portfolios/${id}`, portfolioData);
  } catch (error) {
    console.error(`포트폴리오 수정 실패 (ID: ${id}):`, error);
    throw error;
  }
};

export const deletePortfolio = async (id: string): Promise<void> => {
  try {
    return await instance.DELETE(`/portfolios/${id}`);
  } catch (error) {
    console.error(`포트폴리오 삭제 실패 (ID: ${id}):`, error);
    throw error;
  }
};
