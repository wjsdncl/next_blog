"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useRef, useEffect, useMemo } from "react";
import Navigation from "./_components/Navigation";
import SearchInput from "./_components/SearchInput";
import BlogType from "@/types/blogType";

// 데이터 페칭 함수
const fetchBlogs = async ({ pageParam = 1 }) => {
  const response = await fetch(`/data/db.json`);
  const jsonData = await response.json();

  // 페이지네이션을 구현하기 위해 데이터를 잘라서 반환합니다.
  const start = (pageParam - 1) * 5;
  const end = start + 5;
  const data = jsonData.posts.slice(start, end);

  return { data, nextPage: pageParam + 1, isLast: data.length < 5 };
};

// 날짜 포맷 함수
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }); // YYYY년 MM월 DD일 형식으로 변환
};

const formattedTitle = (title: string) => {
  return title.replace(/\s+/g, "-").toLowerCase();
};

export default function Page() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: fetchBlogs,
    getNextPageParam: (lastPage) => (!lastPage.isLast ? lastPage.nextPage : undefined),
    initialPageParam: 1,
  });

  // 카테고리별 포스트 개수를 계산하는 함수
  const categoryCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    data?.pages.forEach((page) => {
      page.data.forEach((blog: BlogType) => {
        counts[blog.category] = (counts[blog.category] || 0) + 1;
      });
    });
    return counts;
  }, [data]);

  const loadMoreRef = useRef(null);

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
      <Navigation totalPosts={data?.pages?.[0]?.data?.length || 0} categoryCounts={categoryCounts} />
      <section className="flex items-center justify-end">
        <SearchInput />
      </section>

      <div className="pt-8" />

      <section className="flex flex-col gap-8">
        {data?.pages.map((page, pageIndex) =>
          page.data.map((blog: BlogType) => (
            <article key={`${pageIndex}-${blog.id}`} className="flex flex-col gap-4 text-text-primary">
              <Link
                href={`/blog/${blog.id}`}
                as={`/blog/${formattedTitle(blog.title)}`}
                className="flex flex-col gap-4"
              >
                {blog.coverImage && (
                  <div className="relative flex h-96 w-full items-center justify-center">
                    <Image src={blog.coverImage} alt={"coverImage"} className="object-cover" fill sizes="300" />
                  </div>
                )}
                <h2 className="text-3xl font-bold">
                  <span className="pr-2">[{blog.category}]</span>
                  {blog.title}
                </h2>
                <p className="line-clamp-4 text-lg">{blog.content}</p>
              </Link>

              <div className="flex flex-wrap gap-3">
                {blog.tags.map((tag) => (
                  <button key={tag} type="button" className="rounded-md bg-gray-200 px-3 py-2 font-medium">
                    {tag}
                  </button>
                ))}
              </div>

              <div className="flex gap-1 text-gray-500">
                <p>{formatDate(blog.createdAt)}</p>
                <span>.</span>
                <p>댓글 {blog.comments}</p>
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

      <div className="fixed bottom-[70px] right-[16px] z-40 flex h-[48px] w-[130px] items-center justify-center overflow-hidden rounded-full tablet:right-[24px] desktop:right-[calc((100%-1200px)/2)]">
        <button
          type="button"
          className="flex size-full items-center justify-center bg-gray-200 text-text-primary hover:bg-gray-300 active:bg-gray-400"
        >
          <span>새 글 작성하기</span>
        </button>
      </div>
    </div>
  );
}
