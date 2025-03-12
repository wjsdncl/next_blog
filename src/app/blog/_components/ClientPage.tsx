"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import removeMarkdown from "remove-markdown";
import { FavoriteEmpty } from "@/Icons/Favorite";
import { getPostList, POST_TAG } from "@/services/post.api";
import { getUser, USER_TAG } from "@/services/user.api";
import { type Post } from "@/types/BlogType";
import cookies from "@/utils/cookies";
import { diffDate } from "@/utils/FormatDate";
import Navigation from "./Navigation";
import SearchInput from "./SearchInput";

export default function ClientPage() {
  const loadMoreRef = useRef(null);
  const searchParams = useSearchParams();

  // 검색 파라미터 추출
  const searchQuery = searchParams.get("search") ?? undefined; // 검색어 추출
  const categoryQuery = searchParams.get("category") ?? undefined; // 카테고리 추출
  const tagQuery = searchParams.get("tag") ?? undefined; // 태그 추출

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

  // 초기 게시물 데이터를 위한 상태
  const [initialTotalPosts, setInitialTotalPosts] = useState(0);
  const [initialCategoryCounts, setInitialCategoryCounts] = useState({});

  useEffect(() => {
    if (data?.pages[0]) {
      setInitialTotalPosts((prev) => prev || data.pages[0].totalPosts); // 초기 총 게시물 수 설정
      setInitialCategoryCounts((prev) => (Object.keys(prev).length ? prev : data.pages[0].categoryCounts)); // 초기 카테고리 수 설정
    }
  }, [data]);

  // 무한 스크롤 관찰자 설정
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

  // 로딩 상태를 위한 스켈레톤 컴포넌트
  const SkeletonItem = ({ width, height }: { width: string; height: string }) => (
    <div className={`inline-block rounded-md bg-gray-200 ${width} ${height}`} />
  );

  return (
    <>
      <Navigation totalPosts={initialTotalPosts} categoryCounts={initialCategoryCounts} />

      <section className="flex items-center justify-end">
        <SearchInput />
      </section>

      <div className="pt-8" />

      <section className="flex flex-col gap-8">
        {data ? (
          <>
            {data.pages.map((page, pageIndex) =>
              page.posts.map((blog: Post) => (
                <article key={`${pageIndex}-${blog.id}`} className="flex flex-col gap-4 text-text-primary">
                  <Link href={`/blog/${blog.slug}`} className="flex flex-col gap-4">
                    {blog.coverImg && (
                      <div className="relative flex h-96 w-full items-center justify-center">
                        <Image src={blog.coverImg} alt={"coverImage"} className="object-cover" fill sizes="300" />
                      </div>
                    )}
                    <h2 className="text-3xl font-bold">
                      {blog.category && <span className="pr-2">[{blog.category}]</span>}
                      {blog.title}
                    </h2>
                    <p className="line-clamp-4 text-lg">{removeMarkdown(blog.content?.slice(0, 500) as string)}</p>
                  </Link>

                  {blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {blog.tags.map((tag) => (
                        <Link
                          key={tag}
                          href={`/blog?tag=${tag}`}
                          className="rounded-md bg-gray-200 px-3 py-2 font-medium"
                        >
                          {tag}
                        </Link>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-gray-500">
                    <p>{diffDate(blog.createdAt)}</p>
                    <span className="font-extrabold">·</span>
                    <p>댓글 {blog._count?.comments || 0}</p>
                    <span className="font-extrabold">·</span>
                    <FavoriteEmpty width={14} height={14} color="var(--color-gray-500)" />
                    {blog.likes ?? 0}
                  </div>
                </article>
              ))
            )}
          </>
        ) : (
          <>
            {Array.from({ length: 3 }).map((_, index) => (
              <article key={`skeleton-${index}`} className="flex flex-col gap-4 text-text-primary">
                <div className="flex animate-pulse flex-col gap-4">
                  <div className="h-96 w-full rounded-md bg-gray-200" />
                  <div className="h-8 w-80 rounded-md bg-gray-200" />
                  <div className="flex flex-wrap gap-2">
                    {[
                      "w-20",
                      "w-60",
                      "w-40",
                      "w-24",
                      "w-36",
                      "w-52",
                      "w-32",
                      "w-20",
                      "w-56",
                      "w-20",
                      "w-56",
                      "w-24",
                      "w-32",
                      "w-60",
                      "w-72",
                      "w-56",
                    ].map((width, idx) => (
                      <SkeletonItem key={idx} width={width} height="h-5" />
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {["w-20", "w-32", "w-24", "w-36"].map((width, idx) => (
                      <SkeletonItem key={idx} width={width} height="h-8" />
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </>
        )}
      </section>

      <div ref={loadMoreRef} className="flex justify-center py-4">
        {isFetchingNextPage && <p>로딩 중...</p>}
      </div>

      {user && user.isAdmin && (
        <div className="fixed bottom-[70px] right-[16px] z-40 flex h-[48px] w-[130px] items-center justify-center overflow-hidden rounded-full tablet:right-[24px] desktop:right-[calc((100%-1200px)/2)]">
          <Link
            href={"/blog/write"}
            className="flex size-full items-center justify-center bg-gray-200 text-text-primary hover:bg-gray-300 active:bg-gray-400"
          >
            <span>새 글 작성하기</span>
          </Link>
        </div>
      )}
    </>
  );
}
