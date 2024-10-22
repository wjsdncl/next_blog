"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import TagInput from "./TagInput";
import { getPost, updatePost, writePost } from "@/services/post.api";
import { getUser } from "@/services/user.api";
import { PostRequest } from "@/types/blogType";
import toast from "@/utils/Toast";

// FormValues 타입 정의
type FormValues = {
  category?: string;
  title: string;
  content: string;
  tags: string[];
};

export default function MarkdownEditor({ slug }: { slug?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [tempId, setTempId] = useState<string>(searchParams.get("id") ?? crypto.randomUUID());

  // React Hook Form 초기화
  const { handleSubmit, control, watch, setValue } = useForm<FormValues>({
    defaultValues: { title: "", category: "", content: "", tags: [] },
  });

  // 폼 필드 값들 감시
  const title = watch("title");
  const markdown = watch("content");

  // 사용자 데이터 가져오기
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: getUser,
    retry: 0,
    gcTime: 0,
    initialData: () => {
      return queryClient.getQueryData(["user"]);
    },
  });

  // 포스트 데이터를 가져오는 쿼리
  const { data: post } = useQuery({
    queryKey: ["post", slug],
    queryFn: () => getPost(slug as string),
    retry: 0,
    enabled: !!slug,
  });

  // 글 작성 mutation
  const completeWritingMutation = useMutation({
    mutationKey: ["writePost"],
    mutationFn: async (data: PostRequest) => writePost({ postData: data, userId: user?.id as string }),
    onSuccess: () => {
      localStorage.removeItem(tempId); // 임시 저장 데이터 제거
      queryClient.invalidateQueries({ queryKey: ["posts"] }); // 포스트 목록 갱신
      queryClient.invalidateQueries({ queryKey: ["user"] }); // 사용자 데이터 갱신
      router.push("/blog"); // 블로그 목록 페이지로 이동
    },
  });

  // 글 수정 mutation
  const updatePostMutation = useMutation({
    mutationKey: ["updatePost"],
    mutationFn: async (data: { id: number; postData: PostRequest }) =>
      updatePost({ id: data.id, postData: data.postData, userId: user?.id as string }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] }); // 포스트 목록 갱신
      queryClient.invalidateQueries({ queryKey: ["user"] }); // 사용자 데이터 갱신
      router.push("/blog"); // 블로그 목록 페이지로 이동
    },
  });

  // 검색 파라미터에 ID 추가
  const addIdToSearchParams = useCallback(
    (newId: string) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set("id", newId);
      router.replace(`/blog/write?${newSearchParams.toString()}`);
    },
    [searchParams, router]
  );

  // 임시 저장 기능
  const temporarySave = useCallback(() => {
    // 제목이나 내용이 비어있으면 저장하지 않음
    if (!title || !markdown) {
      toast.error("제목 또는 내용이 비어있습니다.");
      return;
    }

    // 임시 저장 로직
    if (!searchParams.get("id") && !slug) {
      const newId = crypto.randomUUID();
      setTempId(newId);
      addIdToSearchParams(newId);
      localStorage.setItem(newId, JSON.stringify({ ...watch() }));
    } else if (slug) {
      setTempId(slug);
      localStorage.setItem(slug, JSON.stringify({ ...watch() }));
    }

    toast.success("임시저장되었습니다.");
  }, [slug, title, markdown, searchParams, watch, addIdToSearchParams]); // 필요한 종속성만 포함

  // 임시 저장된 데이터 불러오기
  useEffect(() => {
    const storedTempData = localStorage.getItem(tempId);

    if (slug && post) {
      // 수정 모드일 때 기존 포스트 데이터 세팅
      setValue("title", post.title);
      setValue("category", post.category || "");
      setValue("content", post.content as string);
      setValue("tags", post.tags || []);
    } else if (storedTempData) {
      // 임시 저장된 데이터가 있으면 불러오기
      const parsedData: FormValues = JSON.parse(storedTempData);
      setValue("title", parsedData.title);
      setValue("category", parsedData.category || "");
      setValue("content", parsedData.content);
      setValue("tags", parsedData.tags || []);
    }
  }, [post, setValue, slug, tempId]); // 필요한 종속성만 포함

  // 글 작성 완료
  const completeWriting = (data: FormValues) => {
    if (completeWritingMutation.isPending || updatePostMutation.isPending) return;

    const postData = { ...data, coverImg: "", userId: user?.id as string };

    if (slug) {
      // 글 수정 시
      updatePostMutation.mutate({ id: Number(post?.id), postData });
    } else {
      // 새 글 작성 시
      completeWritingMutation.mutate(postData);
    }
  };

  // Ctrl + S로 임시 저장
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        temporarySave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [temporarySave]);

  // 코드 블록 컴포넌트 설정
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

  return (
    <form onSubmit={handleSubmit(completeWriting)} className="flex h-dvh w-full">
      {/* 작성 부분 */}
      <div className="flex max-w-[50%] basis-1/2 flex-col bg-background-primary">
        {/* 제목 입력 부분 */}
        <div className="flex size-full flex-col gap-4 p-[64px_40px_10px]">
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                className="h-min w-full resize-none overflow-hidden text-xl font-bold outline-none"
                placeholder="카테고리를 입력하세요"
                onChange={(e) => field.onChange(e)}
                onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
              />
            )}
          />

          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                className="min-h-[45px] w-full resize-none overflow-hidden text-5xl font-bold outline-none"
                placeholder="제목을 입력하세요"
                rows={1}
                required
                onChange={(e) => {
                  field.onChange(e);
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
              />
            )}
          />
          <hr className="mt-3 w-full rounded-full border-[3px] border-brand-secondary dark:border-brand_dark-secondary" />

          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              <TagInput
                tags={field.value}
                addTag={(tag) => field.onChange([...field.value, tag])}
                removeTag={(tag) => field.onChange(field.value.filter((t) => t !== tag))}
              />
            )}
          />

          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                value={markdown}
                onChange={(e) => field.onChange(e)}
                required
                className="size-full resize-none text-lg outline-none scrollbar:w-2 scrollbar:rounded-full scrollbar:bg-gray-200 scrollbar-thumb:rounded-full scrollbar-thumb:bg-gray-300"
                rows={1}
                placeholder="글을 작성하세요"
              />
            )}
          />
        </div>

        {/* 버튼 부분 */}
        <div className="flex w-full items-center justify-between bg-gray-200 px-4 py-3">
          <button
            onClick={() => router.push("/blog")}
            className="w-max text-nowrap rounded-lg px-2 text-lg font-bold text-text-primary"
          >
            나가기
          </button>
          <div className="flex grow items-center justify-end gap-3">
            <button
              onClick={temporarySave}
              type="button"
              className="w-max text-nowrap rounded-lg px-2 text-lg font-bold text-text-primary"
            >
              임시저장
            </button>
            <button
              type="submit"
              className="w-max text-nowrap rounded-lg bg-brand-primary px-4 py-2 text-lg font-bold text-white"
            >
              작성완료
            </button>
          </div>
        </div>
      </div>

      {/* 프리뷰 부분 */}
      <div className="flex max-w-[50%] basis-1/2 flex-col gap-4 overflow-y-auto bg-gray-100 p-[64px_40px_40px] scrollbar:w-2 scrollbar:rounded-full scrollbar:bg-gray-200 scrollbar-thumb:rounded-full scrollbar-thumb:bg-gray-300">
        <h1 className="min-h-[58px] text-5xl font-bold">{title}</h1>

        <div className="prose w-full max-w-none text-lg dark:prose-invert">
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={components}>
            {markdown}
          </ReactMarkdown>
        </div>
      </div>
    </form>
  );
}
