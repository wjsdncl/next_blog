"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useRef, useEffect } from "react";
import { getProjectList, PROJECT_TAG } from "@/services/Project.api";
import type { Project } from "@/types/PortfolioType";
import { formatDate } from "@/utils/FormatDate";
import ProjectCard from "./ProjectCard";

export default function ProjectList({ isOwner }: { isOwner: boolean }) {
  const loadMoreRef = useRef(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: PROJECT_TAG.ALL(),
    queryFn: ({ pageParam = 0 }) => getProjectList({ offset: pageParam }),
    getNextPageParam: (lastPage) => (!lastPage.isLast ? lastPage.nextPage : undefined),
    initialPageParam: 0,
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const SkeletonItem = () => (
    <div className="flex flex-col gap-4 rounded-lg border-2 border-gray-300 bg-gray-100 p-5">
      <div className="animate-pulse">
        <div className="flex items-center pb-2">
          <div className="h-9 grow rounded-md bg-gray-200" />
          <div className="ml-2 h-8 w-20 rounded-md bg-gray-200" />
        </div>
        <div className="h-6 w-1/3 rounded-md bg-gray-200" />
        <hr className="mt-3 border-t-2 border-gray-400" />
      </div>

      <div className="animate-pulse">
        <div className="mb-3 h-[68px] rounded-md bg-gray-200" />
        <div className="space-y-2">
          <div className="h-6 w-32 rounded-md bg-gray-200" />
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="ml-5 h-5 w-3/4 rounded-md bg-gray-200" />
          ))}
        </div>
      </div>

      <div className="flex animate-pulse gap-2 border-l-4 border-brand_dark-secondary px-3 py-2">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="h-6 w-16 rounded-md bg-gray-200" />
        ))}
      </div>

      <div className="flex animate-pulse flex-row-reverse gap-4">
        {Array.from({ length: 2 }).map((_, idx) => (
          <div key={idx} className="h-10 w-32 rounded-md bg-gray-200" />
        ))}
      </div>
    </div>
  );

  return (
    <>
      <section className="mx-auto flex w-full max-w-screen-tablet flex-col gap-6 px-6">
        {data ? (
          <>
            {data.pages.map((page, pageIndex) =>
              page.projects.map((project: Project) => (
                <ProjectCard
                  key={`${pageIndex}-${project.id}`}
                  id={project.id}
                  title={project.title}
                  isPersonal={project.isPersonal}
                  date={`${formatDate(project.startDate)} ~ ${project.endDate ? formatDate(project.endDate) : "진행중"}`}
                  description={project.description}
                  content={project.content}
                  summary={project.summary}
                  techStack={project.techStack}
                  githubLink={project.githubLink}
                  projectLink={project.projectLink}
                  isOwner={isOwner}
                />
              ))
            )}
          </>
        ) : (
          <>
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonItem key={`skeleton-${index}`} />
            ))}
          </>
        )}
      </section>

      <div ref={loadMoreRef} className="flex justify-center py-10">
        {isFetchingNextPage && <p>로딩 중...</p>}
      </div>
    </>
  );
}
