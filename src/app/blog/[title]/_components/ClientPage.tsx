"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import React from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { useShallow } from "zustand/shallow";
import Comments from "./Comments/Comments";
import PostHeader from "./PostHeader";
import { getPost } from "@/services/post.api";
import { getUser } from "@/services/user.api";
import useUserStore from "@/stores/UserStore";

export default function ClientPage({ title }: { title: string }) {
  const queryClient = useQueryClient();

  const { data: post } = useQuery({
    queryKey: ["post", title],
    queryFn: () => getPost(title),
    initialData: () => {
      return queryClient.getQueryData(["posts", title]);
    },
    retry: 0,
  });

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
    return;
  }

  return (
    <div className="relative mx-auto flex size-full flex-col justify-between px-5 py-8 text-lg tablet:w-tablet tablet:px-0">
      <PostHeader post={post} user={user} />

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
        <div className="mb-10 flex h-fit max-h-[200px] w-full rounded-xl bg-gray-200 p-8">
          <div className="grow">
            <Link
              href={`/blog?category=${post.category}`}
              className="text-2xl font-bold text-text-primary hover:underline"
            >
              [ {post.category} ]
            </Link>
          </div>

          {/* <div className="flex h-[60px] items-end gap-2 text-sm font-medium">
            <span className="font-sans">1/1</span>
            <Link href={""}>{"<"}</Link>
            <Link href={""}>{">"}</Link>
          </div> */}
        </div>
      )}

      {/* 본문 */}
      <div className="prose prose-invert text-lg text-text-primary">
        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={components}>
          {post.content}
        </ReactMarkdown>
      </div>

      <div className="mb-10 mt-20 rounded-full border-b-4 border-gray-300" />

      <Comments post={post} />
    </div>
  );
}
