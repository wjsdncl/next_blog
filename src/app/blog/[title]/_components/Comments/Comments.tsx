"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { useShallow } from "zustand/shallow";
import CommentItem from "./CommentItem";
import { deleteComment, editComment, getComments, writeComment } from "@/services/comment.api";
import { getPost } from "@/services/post.api";
import { getUser } from "@/services/user.api";
import useModalStore from "@/stores/ModalStore";
import useUserStore from "@/stores/UserStore";
import { User } from "@/types/authType";
import { CommentRequest } from "@/types/blogType";
import toast from "@/utils/Toast";

interface CommentFormInputs {
  content: string;
}

export default function Comments({ title }: { title: string }) {
  const queryClient = useQueryClient();
  const [editCommentId, setEditCommentId] = useState<number | null>(null);
  const [replyCommentId, setReplyCommentId] = useState<number | null>(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const offset = (page - 1) * limit;

  const { isLoggedIn } = useUserStore(useShallow((state) => ({ isLoggedIn: state.isLoggedIn })));

  // 사용자 데이터 가져오기
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: getUser,
    enabled: isLoggedIn,
    retry: 0,
    initialData: () => {
      return queryClient.getQueryData<User>(["user"]);
    },
  });

  const { data: post } = useQuery({
    queryKey: ["post", title],
    queryFn: () => getPost(title),
    initialData: () => {
      return queryClient.getQueryData(["post", title]);
    },
    retry: 0,
  });

  // 댓글 데이터 가져오기
  const { data: comments, isFetching } = useQuery({
    queryKey: ["comments", post?.id, offset, limit],
    queryFn: () => getComments(post?.id as number, offset, limit),
    enabled: !!post?._count?.comments,
    retry: 0,
  });

  // 총 페이지 수 계산
  const totalPages = Math.ceil((comments?.parentComments ?? 0) / limit);

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", post?.id] });
      queryClient.invalidateQueries({ queryKey: ["post", title] });
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
      queryClient.invalidateQueries({ queryKey: ["comments", post?.title] });
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
            <p className="text-2xl font-bold">{comments?.totalComments ?? 0}개의 댓글</p>
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
        {comments?.comments?.map((comment) => (
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
