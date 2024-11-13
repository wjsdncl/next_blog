import { dehydrate, HydrationBoundary, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Metadata } from "next";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeSlug from "rehype-slug";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import Comments from "./_components/Comments/Comments";
import GenerateTOC from "./_components/GenerateTOC";
import Navigation from "./_components/Navigation";
import PostHeader from "./_components/PostHeader";
import getQueryClient from "@/components/QueryClient";
import { getPost } from "@/services/post.api";
import { User } from "@/types/authType";
import { Post } from "@/types/blogType";

export default async function Page({ params }: { params: { title: string } }) {
  const queryClient = getQueryClient({ staleTime: 60 * 1000 });
  const title = params.title as string;

  const accessToken = cookies().get("accessToken")?.value ?? "";

  await queryClient.prefetchQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["post", title],
    queryFn: async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/posts/${title}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        return response.data;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error fetching post:", error);
        throw new Error("Failed to fetch post");
      }
    },
  });

  const post = queryClient.getQueryData<Post>(["post", title]);
  const user = queryClient.getQueryData<User>(["user"]);

  // 코드 블록 렌더링 설정
  const components = {
    code({
      inline,
      className,
      children,
      ...props
    }: {
      inline?: boolean;
      className?: string;
      children?: React.ReactNode;
    }) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div" {...props}>
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
  };

  if (!post) return;

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="relative mx-auto flex size-full flex-col justify-between px-5 py-8 text-lg tablet:w-tablet tablet:px-0">
        <PostHeader post={post} user={user} />

        {/* 목차 */}
        {post.content && post.content.trim() && <GenerateTOC content={post.content} />}

        {/* 태그 */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pb-5">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${tag}`}
                className="rounded-md bg-gray-200 px-2 py-1 text-base font-medium"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}

        {/* 카테고리 */}
        {post.category && (
          <div className="mb-10 flex h-fit max-h-[200px] w-full rounded-lg bg-gray-200 p-8">
            <div className="grow">
              <Link
                href={`/blog?category=${post.category}`}
                className="text-2xl font-bold text-text-primary hover:underline"
              >
                [ {post.category} ]
              </Link>
            </div>
          </div>
        )}

        {/* 썸네일 */}
        {post.coverImg && (
          <div className="relative h-[400px] w-full max-w-screen-tablet">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <Image src={post.coverImg} alt="coverImage" className="object-contain px-6" fill />
          </div>
        )}

        {/* 본문 */}
        <div className="prose text-lg prose-headings:text-text-primary prose-strong:text-text-primary prose-ul:text-text-primary prose-li:p-0">
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeSlug]} components={components}>
            {post.content}
          </ReactMarkdown>
        </div>

        <div className="mt-20 hidden rounded-full border-b-4 border-gray-300 desktop:mb-10 desktop:flex" />

        {/* 네비게이션 */}
        <div className="mb-10 mt-20 flex w-full items-center justify-end gap-2 desktop:hidden">
          <hr className="grow-[5] rounded-l-full border-2 border-gray-300" />
          <Navigation post={post} />
          <hr className="w-5 rounded-r-full border-2 border-gray-300" />
        </div>

        {/* 댓글 */}
        <Comments post={post} />
      </div>
    </HydrationBoundary>
  );
}

export async function generateMetadata({ params }: { params: { title: string } }): Promise<Metadata> {
  const decodedTitle = decodeURIComponent(params.title).replace(/-/g, " ");

  try {
    return {
      title: `${decodedTitle} | JMJ's Devlog`,
      description: `${decodedTitle}에 대한 블로그 게시글`,
      openGraph: {
        title: `${decodedTitle} | JMJ's Devlog`,
        description: `${decodedTitle}에 대한 블로그 게시글`,
        type: "article",
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch (error) {
    return {
      title: "블로그 게시글을 찾을 수 없습니다. | JMJ's Devlog",
      description: "블로그 게시글을 찾을 수 없습니다.",
    };
  }
}
