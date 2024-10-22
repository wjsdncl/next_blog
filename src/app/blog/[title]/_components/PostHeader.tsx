"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useShallow } from "zustand/shallow";
import { FavoriteEmpty, FavoriteFilled } from "@/Icons/Favorite";
import { deletePost, likePost } from "@/services/post.api";
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

  const LikePostMutation = useMutation({
    mutationKey: ["likePost"],
    mutationFn: async (id: number) => {
      await likePost(id);
    },
    onSuccess: () => {
      const encodedTitle = encodeURIComponent(post?.title ?? "");
      queryClient.invalidateQueries({ queryKey: ["post", encodedTitle] });
    },
  });

  const handleDeleteModal = () => {
    const modalId = openModal(
      "",
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

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(decodeURIComponent(window.location.href));
      toast.success("링크가 클립보드에 복사되었습니다.");
    } catch (err) {
      toast.error("링크 복사에 실패했습니다.");
    }
  };

  const handleLike = () => {
    if (LikePostMutation.isPending) return;
    LikePostMutation.mutateAsync(post.id);
  };

  return (
    <div>
      {/* 제목 */}
      <p className="pb-6 text-[50px] font-bold leading-[52px] text-text-primary">{post.title}</p>

      {/* 작성일, 좋아요, 공유, 수정, 삭제 */}
      <div className="flex size-full items-center justify-between pb-4">
        <p className="grow text-base">{formatDate(post.createdAt)}</p>
        <div className="flex items-center gap-2">
          <button type="button" onClick={handleLike} className="flex items-center gap-1 text-base text-text-primary">
            <div aria-label="like">
              {post.isLiked ? (
                <FavoriteFilled width={18} height={18} color="#656079" />
              ) : (
                <FavoriteEmpty width={18} height={18} color="var(--text-primary)" />
              )}
            </div>
            {post.likes}
          </button>

          <button type="button" onClick={handleShare} className="text-base text-text-primary hover:underline">
            공유
          </button>
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
