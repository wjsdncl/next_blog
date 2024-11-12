"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { useShallow } from "zustand/shallow";
import GenerateTOC from "./GenerateTOC";
import PostHeader from "./PostHeader";
import useDeviceSize from "@/hooks/useDeviceSize";
import { getPost } from "@/services/post.api";
import { getUser } from "@/services/user.api";
import useUserStore from "@/stores/UserStore";

const Comments = dynamic(() => import("./Comments/Comments"), { ssr: false });
const Navigation = dynamic(() => import("./Navigation"), { ssr: false });

export default function ClientPage({ title }: { title: string }) {
  const queryClient = useQueryClient();

  const deviceWidth = useDeviceSize();

  // 게시물 데이터 가져오기
  const { data: post } = useQuery({
    queryKey: ["post", title],
    queryFn: () => getPost(title),
    initialData: () => {
      return queryClient.getQueryData(["post", title]);
    },
    retry: 0,
  });

  // 로그인 여부 가져오기
  const { isLoggedIn } = useUserStore(useShallow((state) => ({ isLoggedIn: state.isLoggedIn })));

  // 사용자 데이터 가져오기
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

  if (!post) {
    return null;
  }

  return (
    <>
      <PostHeader post={post} user={user} />

      {/* 목차 */}
      <GenerateTOC content={post.content as string} />

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
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.coverImg} alt="coverImage" className="mx-5 mb-8 mt-4 object-contain" />
        </>
      )}

      {/* 본문 */}
      <div className="prose text-lg prose-headings:text-text-primary prose-a:text-brand-tertiary prose-strong:text-text-primary prose-ul:text-text-primary prose-li:p-0">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          rehypePlugins={[
            rehypeSlug,
            [
              rehypeAutolinkHeadings,
              {
                properties: {
                  "aria-label": "바로가기",
                },
              },
            ],
          ]}
          components={components}
        >
          {post.content}
        </ReactMarkdown>
      </div>

      <div className="mt-20 hidden rounded-full border-b-4 border-gray-300 desktop:mb-10 desktop:flex" />

      {/* 네비게이션 */}
      {deviceWidth !== "desktop" && (
        <div className="mb-10 mt-20 flex w-full items-center justify-end gap-2">
          <hr className="grow-[5] rounded-l-full border-2 border-gray-300" />
          <Navigation post={post} />
          <hr className="w-5 rounded-r-full border-2 border-gray-300" />
        </div>
      )}

      {/* 댓글 */}
      <Comments post={post} />
    </>
  );
}
