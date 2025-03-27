"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useRef, useEffect, Suspense } from "react";
import { getPostList, POST_TAG } from "@/services/post.api";
import { getUser, USER_TAG } from "@/services/user.api";
import cookies from "@/utils/cookies";
import AdminWriteButton from "./AdminWriteButton";
import BlogPostItem from "./BlogPostItem";
import SearchInput from "./SearchInput";
import { SkeletonPostItem } from "./SkeletonComponents";

const BlogPostList = () => {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const searchParams = useSearchParams();

  // 검색 파라미터 추출
  const searchQuery = searchParams.get("search") ?? undefined;
  const categoryQuery = searchParams.get("category") ?? undefined;
  const tagQuery = searchParams.get("tag") ?? undefined;

  // 사용자 스토어 및 쿼리
  const accessToken = cookies.get("accessToken");

  const { data: user } = useQuery({
    queryKey: USER_TAG,
    queryFn: getUser,
    enabled: !!accessToken,
    retry: 0,
    gcTime: 0,
  });

  // 무한 스크롤을 통한 게시물 가져오기
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: POST_TAG.LIST("newest", searchQuery, categoryQuery, tagQuery),
    queryFn: ({ pageParam = 0 }) =>
      getPostList({ offset: pageParam, search: searchQuery, category: categoryQuery, tag: tagQuery }),
    getNextPageParam: (lastPage) => (!lastPage.isLast ? lastPage.nextPage : undefined),
    initialPageParam: 0,
  });

  const totalPosts = data?.pages[0].totalPosts;
  const remainingPosts = Math.max(0, (totalPosts ?? 0) - 10);

  // 무한 스크롤 관찰자 설정
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

      <AdminWriteButton isAdmin={!!user?.isAdmin} />
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
