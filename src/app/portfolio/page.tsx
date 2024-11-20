import ProjectCard from "./_components/ProjectCard";
import WriteLink from "./_components/WriteLink";
import getQueryClient from "@/components/QueryClient";
import { getProjectList } from "@/services/Project.api";
import { getUser } from "@/services/user.api";
import { User } from "@/types/AuthType";
import { Project } from "@/types/PortfolioType";
import { formatDate } from "@/utils/FormatDate";

export default async function Page() {
  const queryClient = getQueryClient({ staleTime: 60 * 1000 });

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["projectList"],
      queryFn: getProjectList,
    }),
    queryClient.prefetchQuery({
      queryKey: ["user"],
      queryFn: getUser,
    }),
  ]);

  const projectList = queryClient.getQueryData<Project[]>(["projectList"]);
  const user = queryClient.getQueryData<User>(["user"]);

  if (!projectList) {
    return (
      <div className="mx-auto flex size-full flex-col justify-between py-2 tablet:w-tablet desktop:w-desktop">
        <h1 className="mx-auto w-full max-w-screen-tablet text-center text-4xl font-bold">Projects</h1>
        <div className="pt-8" />
        <p className="text-center text-lg font-medium">프로젝트가 없습니다.</p>
      </div>
    );
  }

  return (
    <div
      id="main-content"
      className="mx-auto flex size-full flex-col justify-between py-2 tablet:w-tablet desktop:w-desktop"
    >
      <h1 className="mx-auto w-full max-w-screen-tablet text-center text-4xl font-bold">Projects</h1>

      <div className="pt-8" />

      <section className="mx-auto flex w-full max-w-screen-tablet flex-col gap-4">
        {projectList.map((project) => (
          <ProjectCard
            key={project.id}
            title={project.title}
            isPersonal={project.isPersonal}
            date={`${formatDate(project.startDate)}${project.endDate ? ` ~ ${formatDate(project.endDate)}` : ""}`}
            description={project.description}
            content={project.content}
            summary={project.summary}
            techStack={project.techStack}
            githubLink={project.githubLink}
            projectLink={project.projectLink}
            isOwner={user?.isAdmin ?? false}
          />
        ))}
      </section>

      <div className="fixed bottom-[100px] right-[16px] z-40 flex items-center justify-center overflow-hidden rounded-full tablet:right-[24px] desktop:right-[calc((100%-1200px)/2)]">
        <WriteLink />
      </div>
    </div>
  );
}
