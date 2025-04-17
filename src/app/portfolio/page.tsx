import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { cookies } from "next/headers";
import { getProjectList, PROJECT_TAG } from "@/services/Project.api";
import { getUser } from "@/services/user.api";
import ProjectList from "./_components/ProjectList";
import WriteLink from "./_components/WriteLink";

export default async function Page() {
  const queryClient = new QueryClient();

  const accessToken = cookies().get("accessToken");

  const [project, user] = await Promise.all([
    getProjectList({ offset: 0, limit: 10 }),
    accessToken ? getUser() : undefined,
  ]);

  queryClient.setQueryData(PROJECT_TAG.ALL(), {
    pages: [project],
    pageParams: [0],
  });

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
