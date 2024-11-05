"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useShallow } from "zustand/shallow";
import { deletePost } from "@/services/post.api";
import useModalStore from "@/stores/ModalStore";
import { User } from "@/types/authType";
import { Post } from "@/types/blogType";
import formatDate from "@/utils/FormatDate";
import toast from "@/utils/Toast";

export default function PostHeader({ post, user }: { post: Post; user?: User }) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { openModal, closeModal } = useModalStore(
    useShallow((state) => ({
      openModal: state.openModal,
      closeModal: state.closeModal,
    }))
  );

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

  const handleDeleteModal = () => {
    const modalId = openModal(
      <div className="flex flex-col gap-4">
        <p className="pb-8 pt-6 text-center text-2xl font-semibold">정말로 삭제하시겠습니까?</p>
        <div className="flex gap-4">
          <button
            onClick={() => {
              DeletePostMutation.mutateAsync(post.id);
              modalId && closeModal(modalId);
            }}
            className="grow rounded bg-brand-primary px-4 py-2 text-text-primary hover:bg-brand-secondary dark:hover:bg-brand_dark-secondary"
          >
            삭제
          </button>
          <button
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
    router.push(`/blog/write?title=${post?.slug}`);
  };

  return (
    <div>
      {/* 제목 */}
      <p className="pb-6 text-[50px] font-bold leading-[52px] text-text-primary">{post.title}</p>

      {/* 작성일, 좋아요, 공유, 수정, 삭제 */}
      <div className="flex size-full items-center justify-between pb-4">
        <p className="grow text-base">{formatDate(post.createdAt)}</p>
        <div className="flex items-center gap-2">
          {user && user.isAdmin && (
            <>
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
