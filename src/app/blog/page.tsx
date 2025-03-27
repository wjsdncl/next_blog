import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { type Metadata } from "next";
import dynamic from "next/dynamic";
import { getPostList, POST_TAG } from "@/services/post.api";
import ClientPage from "./_components/ClientPage";

const Navigation = dynamic(() => import("./_components/Navigation"));

export default async function Page({
  searchParams,
}: {
  searchParams: {
    search: string;
    category: string;
    tag: string;
  };
}) {
  const queryClient = new QueryClient();

  const searchQuery = searchParams.search ?? undefined;
  const categoryQuery = searchParams.category ?? undefined;
  const tagQuery = searchParams.tag ?? undefined;

  const posts = await getPostList({
    offset: 0,
    limit: 10,
    search: searchQuery,
    category: categoryQuery,
    tag: tagQuery,
  });
  queryClient.setQueryData(POST_TAG.LIST("newest", searchQuery, categoryQuery, tagQuery), {
    pages: [posts],
    pageParams: [0],
  });

  return (
    <div className="relative mx-auto flex size-full flex-col justify-between px-5 py-8 tablet:w-tablet tablet:px-0">
      <Navigation categoryCounts={posts.categoryCounts} totalPosts={posts.totalPosts} />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ClientPage />
      </HydrationBoundary>
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    return {
      title: "블로그 게시글 목록 | JMJ's Devlog",
      description: "JMJ의 개발 블로그 게시글 목록입니다.",
      openGraph: {
        title: "블로그 게시글 목록 | JMJ's Devlog",
        description: "JMJ의 개발 블로그 게시글 목록입니다.",
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
