export const revalidate = 1800;

import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { type Metadata } from "next";
import nextDynamic from "next/dynamic";
import { publicInstance } from "@/services/instance";
import { getPostList, getCategories, POST_KEYS } from "@/services/post.api";
import { type Post } from "@/types/blogType";
import ClientPage from "./_components/ClientPage";

const Navigation = nextDynamic(() => import("./_components/Navigation"));

export default async function Page() {
  const queryClient = new QueryClient();

  let posts = { posts: [] as Post[], totalPosts: 0, isLast: true, nextPage: 2 };
  let categoryData = { categories: {} as Record<string, number>, totalPosts: 0 };

  try {
    [posts, categoryData] = await Promise.all([
      getPostList({ page: 1, limit: 10 }, publicInstance),
      getCategories(publicInstance),
    ]);
  } catch {
    // 백엔드 다운 시 빈 배열 fallback
  }

  queryClient.setQueryData(POST_KEYS.list("newest"), {
    pages: [posts],
    pageParams: [1],
  });

  return (
    <div className="relative mx-auto flex size-full flex-col justify-between px-5 py-8 tablet:w-tablet tablet:px-0 desktop:w-desktop">
      <Navigation categories={categoryData.categories} totalPosts={categoryData.totalPosts} />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ClientPage />
      </HydrationBoundary>
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    return {
      title: "블로그 게시글 목록 | wjdalswo Devlog",
      description: "wjdalswo의 개발 블로그 게시글 목록입니다.",
      openGraph: {
        title: "블로그 게시글 목록 | wjdalswo Devlog",
        description: "wjdalswo의 개발 블로그 게시글 목록입니다.",
        url: `https://wjsdncl-dev-hub.vercel.app/blog/`,
        type: "website",
      },
      robots: {
        index: true,
        follow: true,
      },
      alternates: {
        canonical: "https://wjsdncl-dev-hub.vercel.app/blog/",
      },
    };
  } catch (error) {
    return {
      title: "블로그 포스트",
      description: "블로그 포스트를 찾을 수 없습니다.",
    };
  }
}
