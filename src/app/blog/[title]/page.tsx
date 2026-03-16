import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import components from "@/components/content/MarkdownComponents";
import { getPost, POST_KEYS } from "@/services/post.api";
import { getUser } from "@/services/user.api";
import PostHeader from "./_components/PostHeader";

const DesktopNavigation = dynamic(() => import("./_components/DesktopNavigation"));
const MobileNavigation = dynamic(() => import("./_components/MobileNavigation"));
const GenerateTOC = dynamic(() => import("./_components/GenerateTOC"));
const Comments = dynamic(() => import("./_components/Comments/Comments"));

export default async function Page({ params }: { params: { title: string } }) {
  const title = params.title;

  const [post, user] = await Promise.all([getPost(title).catch(() => null), getUser()]);

  if (!post) notFound();

  if (post.status !== "PUBLISHED" && user?.role !== "OWNER") {
    return (
      <div className="mx-auto flex size-full grow flex-col items-center justify-center gap-20 px-5 py-8 text-lg tablet:w-tablet tablet:px-0 tablet:pb-40">
        <h1 className="text-center text-4xl font-bold">비공개 게시글입니다.</h1>

        <div className="flex">
          <a href="/" className="rounded-md bg-gray-200 px-6 py-3 text-base font-medium hover:bg-gray-300">
            홈으로 돌아가기
          </a>
        </div>
      </div>
    );
  }

  const queryClient = new QueryClient();
  queryClient.setQueryData(POST_KEYS.detail(decodeURIComponent(title)), post);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="mx-auto flex size-full justify-center gap-10 py-8 desktop:w-desktop">
        {/* 좌측 사이드바: 좋아요/공유 (데스크탑) */}
        <aside className="hidden shrink-0 desktop:flex desktop:justify-end">
          <DesktopNavigation title={decodeURIComponent(title)} user={user} />
        </aside>

        {/* 메인 콘텐츠 */}
        <div className="w-full min-w-0 text-lg tablet:w-tablet desktop:flex-1">
          <PostHeader title={decodeURIComponent(title)} user={user} />

          {/* 태그 */}
          {post.tags && (
            <div className="flex flex-wrap gap-2 pb-5">
              {post.tags.map((tag) => (
                <Link
                  key={tag.slug}
                  href={`/blog?tag=${tag.slug}`}
                  className="rounded-md bg-gray-200 px-2 py-1 text-base font-medium"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          )}

          {/* 썸네일 */}
          {post.cover_image && (
            <div className="relative h-[400px] w-full max-w-screen-tablet">
              <Image
                src={post.cover_image}
                alt="coverImage"
                className="object-contain px-6"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
          )}

          {/* 본문 */}
          <div className="prose text-lg prose-headings:text-text-primary prose-strong:text-text-primary prose-ul:text-text-primary prose-li:p-0">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
              rehypePlugins={[rehypeSlug]}
              components={components}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          <div className="mt-20 hidden rounded-full border-b-4 border-gray-300 desktop:mb-10 desktop:flex" />

          {/* 모바일 네비게이션 */}
          <div className="mb-10 mt-20 flex w-full items-center justify-end gap-2 desktop:hidden">
            <hr className="grow-[5] rounded-l-full border-2 border-gray-300" />
            <MobileNavigation title={decodeURIComponent(title)} user={user} />
            <hr className="w-5 rounded-r-full border-2 border-gray-300" />
          </div>

          {/* 댓글 */}
          <Comments post={post} user={user} />
        </div>

        {/* 우측 사이드바: 목차 (데스크탑) */}
        <aside className="hidden shrink-0 desktop:block desktop:w-[200px]">
          <GenerateTOC content={post.content} />
        </aside>
      </div>
    </HydrationBoundary>
  );
}

export async function generateMetadata({ params }: { params: { title: string } }): Promise<Metadata> {
  const decodedTitle = decodeURIComponent(params.title).replace(/-/g, " ");

  try {
    return {
      title: `${decodedTitle} | wjdalswo Devlog`,
      description: `${decodedTitle}에 대한 블로그 게시글`,
      openGraph: {
        title: `${decodedTitle} | wjdalswo Devlog`,
        description: `${decodedTitle}에 대한 블로그 게시글`,
        url: `https://wjsdncl-dev-hub.vercel.app/blog/${params.title}`,
        type: "article",
      },
      robots: {
        index: true,
        follow: true,
      },
      alternates: {
        canonical: `https://wjsdncl-dev-hub.vercel.app/blog/${params.title}`,
      },
    };
  } catch (error) {
    return {
      title: "블로그 게시글을 찾을 수 없습니다. | wjdalswo Devlog",
      description: "블로그 게시글을 찾을 수 없습니다.",
    };
  }
}
