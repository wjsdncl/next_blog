"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useShallow } from "zustand/shallow";
import { deletePost, getPost, POST_KEYS, updatePost } from "@/services/post.api";
import { revalidatePosts } from "@/services/server.action";
import useModalStore from "@/stores/ModalStore";
import { type User } from "@/types/authType";
import { formatKoreanDate } from "@/utils/FormatDate";
import toast from "@/utils/Toast";
import Navigation from "./Navigation";

export default function PostHeader({ title, user }: { title: string; user?: User }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: post } = useQuery({
    queryKey: POST_KEYS.detail(title),
    queryFn: async () => {
      return await getPost(title);
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    enabled: !!title,
  });

  const { openModal, closeModal } = useModalStore(
    useShallow((state) => ({ openModal: state.openModal, closeModal: state.closeModal }))
  );

  const DeletePostMutation = useMutation({
    mutationKey: ["deletePost"],
    mutationFn: async (id: string) => {
      await deletePost(id);
    },
    onSuccess: async () => {
      await revalidatePosts();
      queryClient.cancelQueries({ queryKey: POST_KEYS.detail(title) });

      toast.success("글이 삭제되었습니다.");
      router.push("/blog");
    },
  });

  const handleDeleteModal = () => {
    if (!post) return;

    const modalId = openModal(
      <div className="flex flex-col gap-4">
        <p className="pb-8 pt-6 text-center text-2xl font-semibold">정말로 삭제하시겠습니까?</p>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => {
              DeletePostMutation.mutateAsync(post.id);
              modalId && closeModal(modalId);
            }}
            className="grow rounded bg-brand-primary px-4 py-2 text-text-primary hover:bg-brand-secondary dark:hover:bg-brand_dark-secondary"
          >
            삭제
          </button>
          <button
            type="button"
            onClick={() => modalId && closeModal(modalId)}
            className="grow rounded bg-gray-300 px-4 py-2 text-text-primary hover:bg-gray-400"
          >
            취소
          </button>
        </div>
      </div>
    );
  };

  const handleEdit = () => {
    if (!post) return;
    router.push(`/blog/write?title=${post.slug}`);
  };

  const statusToggleMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!post) return;

      await updatePost({
        id,
        postData: {
          title: post.title,
          content: post.content,
          tags: post.tags.map((tag) => tag.name),
          status: post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED",
        },
      });
    },
    onSuccess: async () => {
      toast.success("공개 상태가 변경되었습니다.");
      queryClient.invalidateQueries({ queryKey: POST_KEYS.detail(title) });
      await revalidatePosts();
    },
  });

  const handleStatusToggle = () => {
    if (user?.role !== "OWNER" || statusToggleMutation.isPending || !post) return;

    statusToggleMutation.mutate(post.id);
  };

  if (!post) return;

  const isPublished = post.status === "PUBLISHED";

  return (
    <div>
      <div className="flex items-center justify-between">
        {/* 제목 */}
        <p className="pb-6 text-[50px] font-bold leading-[52px] text-text-primary">{post.title}</p>

        <Navigation title={title} />
      </div>

      <div className="flex size-full items-center justify-between pb-4">
        <p className="grow text-base">{formatKoreanDate(post.created_at)}</p>
        <div className="flex items-center gap-4">
          {user?.role === "OWNER" && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-primary">{isPublished ? "공개" : "비공개"}</span>
                <button
                  type="button"
                  onClick={handleStatusToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    !isPublished ? "bg-gray-300" : "bg-brand-primary"
                  }`}
                >
                  <span className="sr-only">공개 상태 변경</span>
                  <span
                    className={`inline-block size-[20px] rounded-full bg-white transition-transform ${
                      !isPublished ? "translate-x-0" : "translate-x-6"
                    }`}
                  />
                </button>
              </div>
              <button type="button" onClick={handleEdit} className="text-base text-text-primary hover:underline">
                수정
              </button>
              <button type="button" onClick={handleDeleteModal} className="text-base text-text-primary hover:underline">
                삭제
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
