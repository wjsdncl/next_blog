import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { getPortfolio, PORTFOLIO_KEYS } from "@/services/portfolio.api";
import { getUser, USER_KEYS } from "@/services/user.api";
import PortfolioForm from "./_components/PortfolioForm";

export default async function PortfolioWritePage({ searchParams }: { searchParams: Promise<{ slug?: string }> }) {
  const { slug } = await searchParams;
  const queryClient = new QueryClient();

  const [portfolio, user] = await Promise.all([slug ? getPortfolio(slug) : undefined, getUser()]);

  if (slug) {
    queryClient.setQueryData(PORTFOLIO_KEYS.detail(slug), portfolio);
  }
  queryClient.setQueryData([...USER_KEYS], user);

  return (
    <div className="mx-auto flex size-full flex-col justify-between py-6 tablet:w-tablet desktop:w-desktop">
      <h1 className="mx-auto w-full max-w-screen-tablet text-4xl font-bold">포트폴리오 작성하기</h1>

      <div className="pt-4" />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <PortfolioForm slug={slug} id={portfolio?.id} />
      </HydrationBoundary>
    </div>
  );
}
