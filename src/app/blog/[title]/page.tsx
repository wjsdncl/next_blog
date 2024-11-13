import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import axios from "axios";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeSlug from "rehype-slug";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import PostHeader from "./_components/PostHeader";
import getQueryClient from "@/components/QueryClient";
import { User } from "@/types/authType";
import { Post } from "@/types/blogType";

const Navigation = dynamic(() => import("./_components/Navigation"));
const GenerateTOC = dynamic(() => import("./_components/GenerateTOC"));
const Comments = dynamic(() => import("./_components/Comments/Comments"));

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
    img: ({ src = "", alt, ...props }: { src?: string; alt?: string }) => (
      <span style={{ display: "block", position: "relative", width: "100%", height: "auto", aspectRatio: "3 / 2" }}>
        <Image
          src={src ?? ""}
          alt={alt ?? ""}
          fill
          sizes="50vw"
          loading="lazy"
          style={{ objectFit: "contain" }}
          {...props}
        />
      </span>
    ),
  };

  if (!post) {
    return (
      <div className="relative mx-auto flex size-full flex-col justify-between px-5 py-8 text-lg tablet:w-tablet tablet:px-0">
        <h1 className="text-4xl font-bold">게시글을 찾을 수 없습니다.</h1>
      </div>
    );
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="relative mx-auto flex size-full flex-col justify-between px-5 py-8 text-lg tablet:w-tablet tablet:px-0">
        <PostHeader post={post} user={user} />

        {/* 목차 */}
        {post.content.trim() && <GenerateTOC content={post.content} />}

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
            <Image
              src={post.coverImg}
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
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeSlug]} components={components}>
            {post.content}
          </ReactMarkdown>
        </div>

        <div className="mt-20 hidden rounded-full border-b-4 border-gray-300 desktop:mb-10 desktop:flex" />

        {/* 네비게이션 */}
        <div className="mb-10 mt-20 flex w-full items-center justify-end gap-2 desktop:hidden">
          <hr className="grow-[5] rounded-l-full border-2 border-gray-300" />
          <Navigation title={title} />
          <hr className="w-5 rounded-r-full border-2 border-gray-300" />
        </div>

        {/* 댓글 */}
        <Comments title={title} />
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
      title: "블로그 게시글을 찾을 수 없습니다. | JMJ's Devlog",
      description: "블로그 게시글을 찾을 수 없습니다.",
    };
  }
}
