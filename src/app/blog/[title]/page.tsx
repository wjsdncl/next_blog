"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { useShallow } from "zustand/shallow";
import { getPost } from "@/services/post.api";
import { getUser } from "@/services/user.api";
import useUserStore from "@/stores/UserStore";
import formatDate from "@/utils/FormatDate";

export default function Page({ params }: { params: { title: string } }) {
  const { data: post } = useQuery({
    queryKey: ["post", params.title],
    queryFn: () => getPost(params.title),
    retry: 0,
    enabled: !!params.title,
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
    return <div>로딩 중...</div>;
  }

  return (
    <div className="relative mx-auto flex size-full flex-col justify-between gap-5 px-5 py-8 text-lg tablet:w-tablet tablet:px-0">
      <p className="pb-8 pt-5 text-[50px] font-bold text-text-primary">{post.title}</p>

      <p className="">{formatDate(post.createdAt)}</p>

      <div className="flex flex-wrap gap-2 pb-4">
        {post.tags.map((tag) => (
          <Link key={tag} href={`/blog?tag=${tag}`} className="rounded-md bg-gray-200 px-2 py-1 text-base font-medium">
            {tag}
          </Link>
        ))}
      </div>

      <div className="flex h-dvh max-h-[130px] min-h-[120px] w-full rounded-xl bg-gray-200 p-8">
        <div className="grow">
          <Link
            href={`/blog?category=${post.category}`}
            className="text-2xl font-bold text-text-primary hover:underline"
          >
            {post.category}
          </Link>
        </div>

        {user && user.isAdmin && (
          <div className="flex h-full w-fit items-end justify-center gap-2">
            <button className="text-sm text-text-primary hover:underline">수정</button>
            <button className="text-sm text-text-primary hover:underline">삭제</button>
          </div>
        )}
      </div>

      <div className="prose prose-invert text-lg">
        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={components}>
          {post.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
