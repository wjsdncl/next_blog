"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { useShallow } from "zustand/shallow";
import Comments from "./Comments/Comments";
import { deletePost, getPost } from "@/services/post.api";
import { getUser } from "@/services/user.api";
import useUserStore from "@/stores/UserStore";
import formatDate from "@/utils/FormatDate";
import toast from "@/utils/Toast";

export default function ClientPage({ title }: { title: string }) {
  const { data: post } = useQuery({
    queryKey: ["post", title],
    queryFn: () => getPost(title),
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

  const queryClient = useQueryClient();
  const router = useRouter();

  const DeletePostMutation = useMutation({
    mutationKey: ["deletePost"],
    mutationFn: async (id: number) => {
      await deletePost(id);
    },
    onSuccess: () => {
      toast.success("글이 삭제되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      router.push("/blog");
    },
  });

  const handleDelete = () => {
    if (!post || DeletePostMutation.isPending) {
      return;
    }

    DeletePostMutation.mutateAsync(post.id);
  };

  const handleEdit = () => {
    router.push(`/blog/write?title=${post?.slug}`);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("링크가 클립보드에 복사되었습니다.");
    } catch (err) {
      toast.error("링크 복사에 실패했습니다.");
    }
  };

  if (!post) {
    return;
  }

  return (
    <div className="relative mx-auto flex size-full flex-col justify-between px-5 py-8 text-lg tablet:w-tablet tablet:px-0">
      {/* 제목 */}
      <p className="pb-6 text-[50px] font-bold leading-[52px] text-text-primary">{post.title}</p>

      {/* 작성일 */}
      <div className="flex size-full items-center justify-between pb-4">
        <p className="grow text-base">{formatDate(post.createdAt)}</p>
        <div className="flex items-center gap-2">
          <button type="button" onClick={handleShare} className="text-base text-text-primary hover:underline">
            공유
          </button>
          {user && user.isAdmin && (
            <>
              <button type="button" onClick={handleEdit} className="text-base text-text-primary hover:underline">
                수정
              </button>
              <button type="button" onClick={handleDelete} className="text-base text-text-primary hover:underline">
                삭제
              </button>
            </>
          )}
        </div>
      </div>

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
