import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { getPortfolio, PORTFOLIO_KEYS } from "@/services/portfolio.api";
import { getUser, USER_KEYS } from "@/services/user.api";
import ProjectForm from "./_components/ProjectForm";

export default async function PortfolioWritePage({ searchParams }: { searchParams: { id: string } }) {
  const queryClient = new QueryClient();

  const [portfolio, user] = await Promise.all([searchParams.id ? getPortfolio(searchParams.id) : undefined, getUser()]);

  queryClient.setQueryData(PORTFOLIO_KEYS.detail(searchParams.id), portfolio);
  queryClient.setQueryData([...USER_KEYS], user);

  if (user?.role !== "OWNER") {
    redirect("/login");
  }

  return (
    <div className="mx-auto flex size-full flex-col justify-between py-6 tablet:w-tablet desktop:w-desktop">
      <h1 className="mx-auto w-full max-w-screen-tablet text-4xl font-bold">포트폴리오 작성하기</h1>

      <div className="pt-4" />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProjectForm id={searchParams.id} />
      </HydrationBoundary>
    </div>
  );
}
