"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useRef, useEffect } from "react";
import ProjectCard from "./ProjectCard";
import { getProjectList } from "@/services/Project.api";
import { Project } from "@/types/PortfolioType";
import { formatDate } from "@/utils/FormatDate";

export default function ProjectList({ isOwner }: { isOwner: boolean }) {
  const loadMoreRef = useRef(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["projects"],
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
    <div className="flex animate-pulse flex-col gap-4 rounded-lg border p-6">
      <div className="h-8 w-3/4 rounded-md bg-gray-200" />
      <div className="h-4 w-1/4 rounded-md bg-gray-200" />
      <div className="h-20 w-full rounded-md bg-gray-200" />
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="h-8 w-20 rounded-md bg-gray-200" />
        ))}
      </div>
    </div>
  );

  return (
    <>
      <section className="mx-auto flex w-full max-w-[1000px] flex-col gap-6">
        {data ? (
          <>
            {data.pages.map((page, pageIndex) =>
              page.projects.map((project: Project) => (
                <ProjectCard
                  key={`${pageIndex}-${project.id}`}
                  title={project.title}
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

      <div ref={loadMoreRef} className="flex justify-center py-4">
        {isFetchingNextPage && <p>로딩 중...</p>}
      </div>
    </>
  );
}
