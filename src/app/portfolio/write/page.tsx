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
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PortfolioForm slug={slug} id={portfolio?.id} />
    </HydrationBoundary>
  );
}
