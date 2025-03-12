import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { getProject, PROJECT_TAG } from "@/services/Project.api";
import { getUser, USER_TAG } from "@/services/user.api";
import ProjectForm from "./_components/ProjectForm";

export default async function PortfolioWritePage({ searchParams }: { searchParams: { id: number } }) {
  const queryClient = new QueryClient();

  const [project, user] = await Promise.all([searchParams.id ? getProject(searchParams.id) : undefined, getUser()]);

  queryClient.setQueryData(PROJECT_TAG.DETAIL(searchParams.id), project);
  queryClient.setQueryData(USER_TAG, user);

  // 관리자가 아니면 로그인 페이지로 이동
  if (!user?.isAdmin) {
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
