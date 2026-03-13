import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { getPortfolioList, PORTFOLIO_KEYS } from "@/services/portfolio.api";
import { getUser } from "@/services/user.api";
import ProjectList from "./_components/ProjectList";
import WriteLink from "./_components/WriteLink";

export default async function Page() {
  const queryClient = new QueryClient();

  const [user, portfolio] = await Promise.all([
    getUser(),
    getPortfolioList({ page: 1, limit: 10 }).catch(() => ({
      portfolios: [],
      isLast: true,
      nextPage: 2,
    })),
  ]);
  const isOwner = user?.role === "OWNER";

  queryClient.setQueryData(PORTFOLIO_KEYS.all(), {
    pages: [portfolio],
    pageParams: [1],
  });

  return (
    <div
      id="main-content"
      className="mx-auto mt-6 flex size-full flex-col justify-between py-2 tablet:w-tablet desktop:w-desktop"
    >
      <h1 className="mx-auto w-full max-w-screen-tablet text-center text-4xl font-bold">Projects</h1>
      <div className="pt-8" />

      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProjectList isOwner={isOwner} />
        <div className="fixed bottom-[100px] right-[16px] z-40 flex items-center justify-center overflow-hidden rounded-full tablet:right-[24px] desktop:right-[calc((100%-1200px)/2)]">
          <WriteLink isOwner={isOwner} />
        </div>
      </HydrationBoundary>
    </div>
  );
}
