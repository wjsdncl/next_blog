"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { useShallow } from "zustand/shallow";
import components from "@/components/MarkdownComponents";
import TagInput from "@/components/TagInput";
import { getPost, updatePost, uploadImage, writePost } from "@/services/post.api";
import { getUser } from "@/services/user.api";
import useModalStore from "@/stores/ModalStore";
import { type PostRequest } from "@/types/BlogType";
import PreviewModal from "./PreviewModal";

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

  const { handleSubmit, control, watch, setValue } = useForm<FormValues>({
    defaultValues: { title: "", category: "", content: "", tags: [] },
  });

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

  const { openModal, closeModal } = useModalStore(
    useShallow((state) => ({ openModal: state.openModal, closeModal: state.closeModal }))
  );

  // 글 작성 mutation
  const completeWritingMutation = useMutation({
    mutationFn: async (data: PostRequest) => writePost({ postData: data, userId: user?.id as string }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] }); // 포스트 목록 갱신
      queryClient.invalidateQueries({ queryKey: ["user"] }); // 사용자 데이터 갱신
      router.push("/blog"); // 블로그 목록 페이지로 이동
    },
  });

  // 글 수정 mutation
  const updatePostMutation = useMutation({
    mutationFn: async (data: { id: number; postData: PostRequest }) =>
      updatePost({ id: data.id, postData: data.postData, userId: user?.id as string }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] }); // 포스트 목록 갱신
      queryClient.invalidateQueries({ queryKey: ["user"] }); // 사용자 데이터 갱신
      router.push("/blog"); // 블로그 목록 페이지로 이동
    },
  });

  // 기존 포스트 데이터 불러오기
  useEffect(() => {
    if (slug && post) {
      setValue("title", post.title);
      setValue("category", post.category || "");
      setValue("content", post.content as string);
      setValue("tags", post.tags || []);
    }
  }, [post, setValue, slug]);

  // 글 작성 완료
  const completeWriting = (data: FormValues) => {
    if (completeWritingMutation.isPending || updatePostMutation.isPending) return;
    const firstImage = markdown.match(/!\[.*?\]\((.*?)\)/)?.[1] || "";

    const modalId = openModal(
      <PreviewModal
        title={data.title}
        content={data.content}
        initialCoverImg={post?.coverImg || firstImage}
        onComplete={(coverImg) => {
          const postData = { ...data, coverImg, userId: user?.id as string };
          slug
            ? updatePostMutation.mutate({ id: Number(post?.id), postData })
            : completeWritingMutation.mutate(postData);
          closeModal(modalId);
        }}
      />
    );
  };

  // 이미지 업로드
  const handleImageUpload = async (file: File, tempText: string) => {
    setValue("content", `${watch("content")}${tempText}`);
    try {
      const imageUrl = await uploadImage(file);
      setValue("content", `${watch("content").replace(tempText, `\n![image](${imageUrl})`)}`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Image upload failed:", error);
    }
  };

  // 이미지 드래그 앤 드랍
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleImageUpload(file, "\n![Uploading image...]()");
    }
  };

  // 이미지 붙여넣기
  const handlePaste = (event: React.ClipboardEvent) => {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          handleImageUpload(file, "\n![Uploading image...]()");
        }
        break;
      }
    }
  };

  // 스크롤 동기화를 위한 ref 추가
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // 스크롤 동기화 함수
  const handleEditorScroll = useCallback(() => {
    if (!editorRef.current || !previewRef.current) return;

    const editorElement = editorRef.current;
    const previewElement = previewRef.current;

    const percentage = editorElement.scrollTop / (editorElement.scrollHeight - editorElement.clientHeight);
    const previewScrollTop = percentage * (previewElement.scrollHeight - previewElement.clientHeight);

    previewElement.scrollTop = previewScrollTop;
  }, []);

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
                ref={editorRef}
                value={markdown}
                onDrop={handleDrop}
                onPaste={handlePaste}
                onChange={(e) => field.onChange(e)}
                onScroll={handleEditorScroll}
                required
                className="size-full resize-none text-lg outline-none scrollbar-hide"
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
          <button
            type="submit"
            className="w-max text-nowrap rounded-lg bg-brand-primary px-4 py-2 text-lg font-bold text-white"
          >
            작성완료
          </button>
        </div>
      </div>

      {/* 프리뷰 부분 */}
      <div
        ref={previewRef}
        className="flex max-w-[50%] basis-1/2 flex-col gap-4 overflow-y-auto bg-gray-100 p-[64px_40px_40px] scrollbar:w-2 scrollbar:rounded-full scrollbar:bg-gray-200 scrollbar-thumb:rounded-full scrollbar-thumb:bg-gray-300"
      >
        <h1 className="min-h-[58px] text-5xl font-bold">{title}</h1>

        <div className="prose text-lg prose-headings:text-text-primary prose-strong:text-text-primary prose-ul:text-text-primary prose-li:p-0">
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={components}>
            {markdown}
          </ReactMarkdown>
        </div>
      </div>
    </form>
  );
}
