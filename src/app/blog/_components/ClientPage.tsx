"use client";

import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRef, useEffect, Suspense, useState } from "react";
import removeMarkdown from "remove-markdown";
import { useShallow } from "zustand/shallow";
import Navigation from "./Navigation";
import SearchInput from "./SearchInput";
import { getPostList } from "@/services/post.api";
import { getUser } from "@/services/user.api";
import useUserStore from "@/stores/UserStore";
import { Post } from "@/types/blogType";
import formatDate from "@/utils/FormatDate";

export default function ClientPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") ?? undefined; // 검색어 추출
  const categoryQuery = searchParams.get("category") ?? undefined; // 카테고리 추출
  const tagQuery = searchParams.get("tag") ?? undefined; // 태그 추출
  const queryClient = useQueryClient();

  const { isLoggedIn } = useUserStore(
    useShallow((state) => ({
      isLoggedIn: state.isLoggedIn,
    }))
  );

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: getUser,
    enabled: isLoggedIn,
    retry: 0,
    gcTime: 0,
    initialData: () => {
      return queryClient.getQueryData(["user"]);
    },
  });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["posts", searchQuery, categoryQuery, tagQuery],
    queryFn: ({ pageParam = 0 }) =>
      getPostList({ pageParam, search: searchQuery, category: categoryQuery, tag: tagQuery }),
    getNextPageParam: (lastPage) => (!lastPage.isLast ? lastPage.nextPage : undefined),
    initialPageParam: 0,
  });

  const loadMoreRef = useRef(null);
  const [initialTotalPosts, setInitialTotalPosts] = useState(0);
  const [initialCategoryCounts, setInitialCategoryCounts] = useState({});

  useEffect(() => {
    if (data?.pages[0]) {
      setInitialTotalPosts((prev) => prev || data.pages[0].totalPosts);
      setInitialCategoryCounts((prev) => (Object.keys(prev).length ? prev : data.pages[0].categoryCounts));
    }
  }, [data]);

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

  return (
    <div className="relative mx-auto flex size-full flex-col justify-between px-5 py-8 tablet:w-tablet tablet:px-0">
      <Navigation totalPosts={initialTotalPosts} categoryCounts={initialCategoryCounts} />
      <section className="flex items-center justify-end">
        <Suspense>
          <SearchInput />
        </Suspense>
      </section>

      <div className="pt-8" />

      <section className="flex flex-col gap-8">
        {data?.pages.map((page, pageIndex) =>
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
                <p className="line-clamp-4 text-lg">{removeMarkdown(blog.content as string)}</p>
              </Link>

              {blog.tags.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {blog.tags.map((tag) => (
                    <Link key={tag} href={`/blog?tag=${tag}`} className="rounded-md bg-gray-200 px-3 py-2 font-medium">
                      {tag}
                    </Link>
                  ))}
                </div>
              )}

              <div className="flex gap-1 text-gray-500">
                <p>{formatDate(blog.createdAt)}</p>
                <span>.</span>
                <p>댓글 {blog._count?.comments || 0}</p>
                <span>.</span>
                <p>좋아요 {blog.likes}</p>
              </div>
            </article>
          ))
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
    </div>
  );
}
