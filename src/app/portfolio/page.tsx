import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import ProjectList from "./_components/ProjectList";
import WriteLink from "./_components/WriteLink";
import getQueryClient from "@/components/QueryClient";
import { getProjectList } from "@/services/Project.api";
import { getUser } from "@/services/user.api";
import { User } from "@/types/AuthType";
import { Project } from "@/types/PortfolioType";

interface ProjectList {
  pages: {
    projects: Project[];
    isLast: boolean;
    nextPage: number;
  };
  pageParams: number[];
}

export default async function Page() {
  const queryClient = getQueryClient({ staleTime: 60 * 1000 });

  await Promise.all([
    queryClient.prefetchInfiniteQuery({
      queryKey: ["projectList"],
      queryFn: ({ pageParam = 0 }) => getProjectList({ offset: pageParam, limit: 10 }),
      initialPageParam: 0,
    }),
    queryClient.prefetchQuery({
      queryKey: ["user"],
      queryFn: getUser,
    }),
  ]);

  const user = queryClient.getQueryData<User>(["user"]);

  return (
    <div
      id="main-content"
      className="mx-auto mt-6 flex size-full flex-col justify-between py-2 tablet:w-tablet desktop:w-desktop"
    >
      <h1 className="mx-auto w-full max-w-screen-tablet text-center text-4xl font-bold">Projects</h1>
      <div className="pt-8" />

      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProjectList isOwner={user?.isAdmin ?? false} />
      </HydrationBoundary>
      <div className="fixed bottom-[100px] right-[16px] z-40 flex items-center justify-center overflow-hidden rounded-full tablet:right-[24px] desktop:right-[calc((100%-1200px)/2)]">
        <WriteLink />
      </div>
    </div>
  );
}
