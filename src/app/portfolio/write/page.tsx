import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import getQueryClient from "@/components/QueryClient";
import { getProject } from "@/services/Project.api";
import { getUser } from "@/services/user.api";
import { type User } from "@/types/AuthType";
import ProjectForm from "./_components/ProjectForm";

export default async function PortfolioWritePage({ searchParams }: { searchParams: { id: number } }) {
  const queryClient = getQueryClient({ staleTime: 60 * 1000 });

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["project", searchParams.id],
      queryFn: () => getProject(searchParams.id),
    }),
    queryClient.prefetchQuery({
      queryKey: ["user"],
      queryFn: getUser,
    }),
  ]);

  const user = queryClient.getQueryData<User>(["user"]);

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
