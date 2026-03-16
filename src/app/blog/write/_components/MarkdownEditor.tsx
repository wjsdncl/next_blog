"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { useShallow } from "zustand/shallow";
import components from "@/components/content/MarkdownComponents";
import TagInput from "@/components/ui/TagInput";
import { revalidatePosts } from "@/services/actions/revalidate.action";
import { getPost, POST_KEYS, updatePost, uploadImage, createPost, resolveCategoryId } from "@/services/post.api";
import { resolveTagIds } from "@/services/tag.api";
import { USER_KEYS } from "@/services/user.api";
import useModalStore from "@/stores/ModalStore";
import type { PostRequest } from "@/types/blogType";
import toast from "@/utils/toast";
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

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { title: "", category: "", content: "", tags: [] },
  });

  const title = watch("title");
  const markdown = watch("content");

  const { data: post } = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: POST_KEYS.detail(slug as string),
    queryFn: () => getPost(slug as string),
    retry: 0,
    enabled: !!slug,
  });

  const { openModal, closeModal } = useModalStore(
    useShallow((state) => ({ openModal: state.openModal, closeModal: state.closeModal }))
  );

  const completeWritingMutation = useMutation({
    mutationFn: async (data: PostRequest) => createPost(data),
    onSuccess: async () => {
      await revalidatePosts();
      queryClient.invalidateQueries({ queryKey: POST_KEYS.all() });
      queryClient.invalidateQueries({ queryKey: [...USER_KEYS] });
      router.push("/blog");
    },
    onError: (error: Error) => {
      toast.error(error.message || "게시글 작성에 실패했습니다.");
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: async (data: { id: string; postData: PostRequest }) =>
      updatePost({ id: data.id, postData: data.postData }),
    onSuccess: async () => {
      await revalidatePosts();
      queryClient.invalidateQueries({ queryKey: POST_KEYS.all() });
      queryClient.invalidateQueries({ queryKey: [...USER_KEYS] });
      router.push("/blog");
    },
    onError: (error: Error) => {
      toast.error(error.message || "게시글 수정에 실패했습니다.");
    },
  });

  useEffect(() => {
    if (slug && post) {
      setValue("title", post.title);
      setValue("category", post.category?.name || "");
      setValue("content", post.content as string);
      setValue("tags", post.tags.map((tag) => tag.name) || []);
    }
  }, [post, setValue, slug]);

  const completeWriting = async (data: FormValues) => {
    if (completeWritingMutation.isPending || updatePostMutation.isPending) return;
    const firstImage = markdown.match(/!\[.*?\]\((.*?)\)/)?.[1] || "";

    // 카테고리 name → ID 변환 (없는 카테고리는 자동 생성)
    const category_id = data.category ? await resolveCategoryId(data.category) : undefined;

    // 태그 name → ID 변환 (없는 태그는 자동 생성)
    const tag_ids = await resolveTagIds(data.tags);

    const modalId = openModal(
      <PreviewModal
        title={data.title}
        content={data.content}
        initialCoverImg={post?.cover_image || firstImage}
        onComplete={(coverImage) => {
          const postData: PostRequest = {
            title: data.title,
            content: data.content,
            status: "PUBLISHED",
            category_id,
            tag_ids,
            cover_image: coverImage,
          };
          slug
            ? updatePostMutation.mutate({ id: post?.id as string, postData })
            : completeWritingMutation.mutate(postData);
          closeModal(modalId);
        }}
      />
    );
  };

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

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleImageUpload(file, "\n![Uploading image...]()");
    }
  };

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

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleEditorScroll = useCallback(() => {
    if (!editorRef.current || !previewRef.current) return;

    const editorElement = editorRef.current;
    const previewElement = previewRef.current;

    const percentage = editorElement.scrollTop / (editorElement.scrollHeight - editorElement.clientHeight);
    const previewScrollTop = percentage * (previewElement.scrollHeight - previewElement.clientHeight);

    previewElement.scrollTop = previewScrollTop;
  }, []);

  return (
    <form
      onSubmit={handleSubmit(completeWriting, (fieldErrors) => {
        const firstError = Object.values(fieldErrors)[0];
        if (firstError?.message) toast.error(firstError.message as string);
      })}
      className="flex h-dvh w-full"
    >
      <div className="flex max-w-[50%] basis-1/2 flex-col bg-background-primary">
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
            rules={{ required: "제목을 입력해주세요" }}
            render={({ field }) => (
              <textarea
                {...field}
                className={`min-h-[45px] w-full resize-none overflow-hidden text-5xl font-bold outline-none ${errors.title ? "placeholder:text-error" : ""}`}
                placeholder="제목을 입력하세요 *"
                rows={1}
                onChange={(e) => {
                  field.onChange(e);
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
              />
            )}
          />
          <hr className="mt-3 w-full rounded-full border-[3px] border-brand_dark-secondary" />

          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              <TagInput
                tags={field.value}
                addTag={(tag) => field.onChange([...field.value, tag])}
                removeTag={(tag) => field.onChange(field.value.filter((t) => t !== tag))}
                addTags={(newTags: string[]) => {
                  const uniqueTags = [...new Set([...(field.value || []), ...newTags])];
                  field.onChange(uniqueTags);
                }}
              />
            )}
          />

          <Controller
            name="content"
            control={control}
            rules={{ required: "내용을 입력해주세요" }}
            render={({ field }) => (
              <textarea
                {...field}
                ref={editorRef}
                value={markdown}
                onDrop={handleDrop}
                onPaste={handlePaste}
                onChange={(e) => field.onChange(e)}
                onScroll={handleEditorScroll}
                className={`size-full resize-none text-lg outline-none scrollbar-hide ${errors.content ? "placeholder:text-error" : ""}`}
                rows={1}
                placeholder="글을 작성하세요 *"
              />
            )}
          />
        </div>

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
