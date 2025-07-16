"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { useShallow } from "zustand/shallow";
import { COMMENT_TAG, deleteComment, editComment, getComments, writeComment } from "@/services/comment.api";
import useModalStore from "@/stores/ModalStore";
import { type User } from "@/types/AuthType";
import { type Post, type CommentRequest } from "@/types/BlogType";
import toast from "@/utils/Toast";
import CommentItem from "./CommentItem";

interface CommentFormInputs {
  content: string;
}

export default function Comments({ post, user }: { post: Post; user?: User }) {
  const queryClient = useQueryClient();
  const [editCommentId, setEditCommentId] = useState<number | null>(null);
  const [replyCommentId, setReplyCommentId] = useState<number | null>(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const offset = (page - 1) * limit;

  // 댓글 데이터 가져오기
  const { data, isFetching } = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: COMMENT_TAG.POST(post.id as number, offset, limit),
    queryFn: () => getComments(post.id as number, offset, limit),
    enabled: !!post.commentsCount,
    retry: 0,
  });

  const comments = data?.comments;
  const totalCount = data?.totalCount;

  // 총 페이지 수 계산
  const totalPages = Math.ceil((totalCount ?? 0) / limit);

  // 댓글 작성 폼
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<CommentFormInputs>();

  // 댓글 작성 mutation
  const writeCommentMutation = useMutation({
    mutationFn: async (body: CommentRequest) => {
      await writeComment(body);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: COMMENT_TAG.ALL() });

      toast.success("댓글이 등록되었습니다.");
      reset();
      setReplyCommentId(null);
    },
    onError: () => {
      toast.error("댓글 등록에 실패했습니다.");
    },
  });

  // 댓글 수정 mutation
  const editCommentMutation = useMutation({
    mutationFn: async ({ id, content }: { id: number; content: string }) => {
      await editComment(id, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMMENT_TAG.ALL() });
      toast.success("댓글이 수정되었습니다.");
      setEditCommentId(null);
    },
    onError: () => {
      toast.error("댓글 수정에 실패했습니다.");
    },
  });

  // 댓글 삭제 mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (id: number) => {
      await deleteComment(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMMENT_TAG.ALL() });
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

  // 댓글 작성 함수
  const onSubmit = (data: CommentFormInputs) => {
    if (writeCommentMutation.isPending || !post) return;
    writeCommentMutation.mutate({
      content: data.content,
      postId: post.id as number,
      userId: user?.id,
      parentCommentId: undefined,
    });
  };

  // 답글 작성 함수
  const handleReply = (commentId: number) => {
    setReplyCommentId(replyCommentId === commentId ? null : commentId);
  };

  // 댓글 수정 함수
  const handleEdit = (commentId: number) => {
    setEditCommentId(commentId);
  };

  // 답글 작성 함수
  const handleSubmitReply = (content: string, parentCommentId: number) => {
    if (writeCommentMutation.isPending || !post) return;
    writeCommentMutation.mutate({
      content,
      postId: post.id as number,
      userId: user?.id,
      parentCommentId,
    });
  };

  // 수정한 댓글 등록 함수
  const handleSubmitEdit = (content: string, commentId: number) => {
    editCommentMutation.mutate({ id: commentId, content });
  };

  // 댓글 삭제 모달
  const handleDeleteModal = (id: number) => {
    const modalId = openModal(
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
            <p className="text-2xl font-bold">{totalCount ?? 0}개의 댓글</p>
            {user ? (
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
            disabled={!user || isSubmitting}
            className="h-32 w-full resize-none rounded-lg border-2 border-gray-300 p-3 text-lg"
            placeholder={user ? "댓글을 입력하세요." : "로그인 후 댓글을 작성할 수 있습니다."}
          />
        </form>
      </Suspense>

      <div className="flex flex-col gap-4">
        {comments?.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            currentUser={user}
            isLoggedIn={!!user}
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
