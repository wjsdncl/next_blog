"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useRef, useEffect, Suspense } from "react";
import { getPostList, POST_KEYS } from "@/services/post.api";
import AdminWriteButton from "./AdminWriteButton";
import BlogPostItem from "./BlogPostItem";
import SearchInput from "./SearchInput";
import { SkeletonPostItem } from "./SkeletonComponents";

const BlogPostList = () => {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const searchParams = useSearchParams();

  const searchQuery = searchParams.get("search") ?? undefined;
  const categoryQuery = searchParams.get("category") ?? undefined;
  const tagQuery = searchParams.get("tag") ?? undefined;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: POST_KEYS.list("newest", searchQuery, categoryQuery, tagQuery),
    queryFn: ({ pageParam = 1 }) =>
      getPostList({ page: pageParam, search: searchQuery, category: categoryQuery, tag: tagQuery }),
    getNextPageParam: (lastPage) => (!lastPage.isLast ? lastPage.nextPage : undefined),
    initialPageParam: 1,
  });

  const totalPosts = data?.pages[0].totalPosts;
  const remainingPosts = Math.max(0, (totalPosts ?? 0) - 10);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
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

  return (
    <>
      <section className="flex items-center justify-end">
        <SearchInput />
      </section>

      <div className="pt-8" />

      <section className="flex flex-col gap-8">
        {data ? (
          <>
            {data.pages.map((page, pageIndex) =>
              page.posts.map((blog) => (
                <BlogPostItem key={`${pageIndex}-${blog.id}`} blog={blog} pageIndex={pageIndex} />
              ))
            )}

            {isFetchingNextPage && (
              <>
                {Array.from({ length: Math.min(remainingPosts, 10) }).map((_, index) => (
                  <SkeletonPostItem key={`loading-skeleton-${index}`} />
                ))}
              </>
            )}

            {hasNextPage && <div ref={loadMoreRef} className="h-10 w-full" />}
          </>
        ) : (
          <>
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonPostItem key={`initial-skeleton-${index}`} />
            ))}
          </>
        )}
      </section>

      <AdminWriteButton />
    </>
  );
};

export default function ClientPage() {
  return (
    <Suspense>
      <BlogPostList />
    </Suspense>
  );
}
