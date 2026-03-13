import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { type Metadata } from "next";
import nextDynamic from "next/dynamic";
import { getPostList, getCategories, POST_KEYS } from "@/services/post.api";
import { getUser } from "@/services/user.api";
import { type Post } from "@/types/blogType";
import ClientPage from "./_components/ClientPage";

const Navigation = nextDynamic(() => import("./_components/Navigation"));

export default async function Page() {
  const queryClient = new QueryClient();
  const user = await getUser();
  const isOwner = user?.role === "OWNER";

  let posts = { posts: [] as Post[], totalPosts: 0, isLast: true, nextPage: 2 };
  let categoryData = { categories: {} as Record<string, number>, totalPosts: 0 };

  try {
    [posts, categoryData] = await Promise.all([getPostList({ page: 1, limit: 10 }), getCategories()]);
  } catch {
    // 백엔드 다운 시 빈 배열 fallback
  }

  queryClient.setQueryData(POST_KEYS.list("newest"), {
    pages: [posts],
    pageParams: [1],
  });

  return (
    <div className="mx-auto flex size-full justify-center gap-8 px-5 py-8 desktop:w-desktop">
      <aside className="hidden shrink-0 desktop:block desktop:w-[130px]">
        <Navigation categories={categoryData.categories} totalPosts={categoryData.totalPosts} />
      </aside>
      <div className="w-full min-w-0 tablet:w-tablet desktop:flex-1">
        {/* 모바일/태블릿에서는 nav를 콘텐츠 위에 표시 */}
        <div className="mb-4 desktop:hidden">
          <Navigation categories={categoryData.categories} totalPosts={categoryData.totalPosts} />
        </div>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <ClientPage isOwner={isOwner} />
        </HydrationBoundary>
      </div>
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
