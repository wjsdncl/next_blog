"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { useShallow } from "zustand/shallow";
import CommentItem from "./CommentItem";
import { deleteComment, editComment, getComments, writeComment } from "@/services/comment.api";
import { getUser } from "@/services/user.api";
import useModalStore from "@/stores/ModalStore";
import useUserStore from "@/stores/UserStore";
import { CommentRequest, Post } from "@/types/blogType";
import toast from "@/utils/Toast";

interface CommentFormInputs {
  content: string;
}

export default function Comments({ post }: { post?: Post }) {
  const queryClient = useQueryClient();
  const [editCommentId, setEditCommentId] = useState<number | null>(null);
  const [replyCommentId, setReplyCommentId] = useState<number | null>(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(10); // 한 페이지당 보여줄 댓글 수
  const offset = (page - 1) * limit; // 현재 페이지에 따라 offset 계산

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
  });

  const { data: comments, isFetching } = useQuery({
    queryKey: ["comments", post?.title, offset, limit],
    queryFn: () => getComments(post?.title as string, offset, limit),
    enabled: !!post?._count?.comments,
    retry: 0,
  });

  const totalPages = Math.ceil((comments?.parentComments ?? 0) / limit);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<CommentFormInputs>();

  const writeCommentMutation = useMutation({
    mutationKey: ["writeComment"],
    mutationFn: async (body: CommentRequest) => {
      await writeComment(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", post?.title] });
      queryClient.invalidateQueries({ queryKey: ["post", post?.title] });
      toast.success("댓글이 등록되었습니다.");
      reset();
      setReplyCommentId(null);
    },
    onError: () => {
      toast.error("댓글 등록에 실패했습니다.");
    },
  });

  const editCommentMutation = useMutation({
    mutationKey: ["editComment"],
    mutationFn: async ({ id, content }: { id: number; content: string }) => {
      await editComment(id, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", post?.title] });
      toast.success("댓글이 수정되었습니다.");
      setEditCommentId(null);
    },
    onError: () => {
      toast.error("댓글 수정에 실패했습니다.");
    },
  });

  const deleteCommentMutation = useMutation({
    mutationKey: ["deleteComment"],
    mutationFn: async (id: number) => {
      await deleteComment(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", post?.title] });
      toast.success("댓글이 삭제되었습니다.");
    },
    onError: () => {
      toast.error("댓글 삭제에 실패했습니다.");
    },
  });

  const { openModal, closeModal } = useModalStore(
    useShallow((state) => ({
      openModal: state.openModal,
      closeModal: state.closeModal,
    }))
  );

  const onSubmit = (data: CommentFormInputs) => {
    if (writeCommentMutation.isPending || !post) return;
    writeCommentMutation.mutate({
      content: data.content,
      postId: post.id as number,
      userId: user?.id,
      parentCommentId: undefined,
    });
  };

  const handleReply = (commentId: number) => {
    setReplyCommentId(replyCommentId === commentId ? null : commentId);
  };

  const handleEdit = (commentId: number) => {
    setEditCommentId(commentId);
  };

  const handleSubmitReply = (content: string, parentCommentId: number) => {
    if (writeCommentMutation.isPending || !post) return;
    writeCommentMutation.mutate({
      content,
      postId: post.id as number,
      userId: user?.id,
      parentCommentId,
    });
  };

  const handleSubmitEdit = (content: string, commentId: number) => {
    editCommentMutation.mutate({ id: commentId, content });
  };

  const handleDeleteModal = (id: number) => {
    const modalId = openModal(
      "",
      <div className="flex flex-col gap-4">
        <p className="pb-8 pt-6 text-center text-2xl font-semibold">정말로 삭제하시겠습니까?</p>
        <div className="flex gap-4">
          <button
            onClick={() => {
              deleteCommentMutation.mutate(id);
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

  return (
    <div className="flex flex-col gap-4 pb-32">
      <Suspense fallback={null}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-4">
          <div className="flex w-full grow items-center justify-between">
            <p className="text-2xl font-bold">{comments?.totalComments ?? 0}개의 댓글</p>
            {isLoggedIn ? (
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-12 w-20 rounded-lg bg-brand-primary text-lg font-bold text-text-primary transition-colors hover:bg-brand-secondary dark:hover:bg-brand_dark-secondary"
              >
                {isSubmitting ? "등록 중..." : "등록"}
              </button>
            ) : (
              <Link
                href="/login"
                className="flex h-12 w-20 items-center justify-center rounded-lg bg-gray-200 text-lg font-semibold text-gray-500"
              >
                로그인
              </Link>
            )}
          </div>
          <textarea
            {...register("content", { required: true })}
            disabled={!isLoggedIn || isSubmitting}
            className="h-32 w-full resize-none rounded-lg border-2 border-gray-300 p-3 text-lg"
            placeholder={isLoggedIn ? "댓글을 입력하세요." : "로그인 후 댓글을 작성할 수 있습니다."}
          />
        </form>
      </Suspense>

      <div className="flex flex-col gap-4">
        {comments?.comments?.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            currentUser={user}
            isLoggedIn={isLoggedIn}
            replyCommentId={replyCommentId}
            editCommentId={editCommentId}
            onReply={handleReply}
            onEdit={handleEdit}
            onDelete={handleDeleteModal}
            onSubmitReply={handleSubmitReply}
            onSubmitEdit={handleSubmitEdit}
            setEditCommentId={setEditCommentId}
          />
        ))}
      </div>

      <div className="flex items-center justify-center gap-2">
        {[...Array(totalPages)].map((_, index) => {
          const pageIndex = index + 1;
          return (
            <button
              key={pageIndex}
              onClick={() => setPage(pageIndex)}
              disabled={pageIndex === page || isFetching}
              className={`${pageIndex === page ? "bg-gray-100" : ""} size-10 rounded-lg bg-gray-200 text-lg font-semibold`}
            >
              {pageIndex}
            </button>
          );
        })}
      </div>
    </div>
  );
}
