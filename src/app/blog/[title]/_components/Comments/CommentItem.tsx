import React from "react";
import { useForm } from "react-hook-form";
import CommentContent from "./CommentContent";
import { User } from "@/types/authType";
import { Comment } from "@/types/blogType";
import formatDate from "@/utils/FormatDate";

interface CommentFormInputs {
  content: string;
}

interface CommentItemProps {
  comment: Comment;
  depth?: number;
  currentUser?: User;
  isLoggedIn: boolean;
  replyCommentId: number | null;
  editCommentId: number | null;
  parentComment?: Comment; // 부모 댓글 정보 추가
  onReply: (commentId: number) => void;
  onEdit: (commentId: number, content: string) => void;
  onDelete: (commentId: number) => void;
  onSubmitReply: (content: string, parentCommentId: number) => void;
  onSubmitEdit: (content: string, commentId: number) => void;
  setEditCommentId: (id: number | null) => void;
}

export default function CommentItem({
  comment,
  depth = 0,
  currentUser,
  isLoggedIn,
  replyCommentId,
  editCommentId,
  parentComment,
  onReply,
  onEdit,
  onDelete,
  onSubmitReply,
  onSubmitEdit,
  setEditCommentId,
}: CommentItemProps) {
  const {
    register: replyRegister,
    handleSubmit: handleReplySubmit,
    formState: { isSubmitting: isReplySubmitting },
    watch,
  } = useForm<CommentFormInputs>();

  const {
    register: editRegister,
    handleSubmit: handleEditSubmit,
    formState: { isSubmitting: isEditSubmitting },
  } = useForm<CommentFormInputs>();

  const onReplySubmit = (data: CommentFormInputs) => {
    // depth가 10 이상일 때는 부모 댓글의 ID를 사용
    const targetCommentId = depth >= 10 ? (comment.parentCommentId ?? comment.id) : comment.id;
    onSubmitReply(data.content, targetCommentId);
  };

  const onEditSubmit = (data: CommentFormInputs) => {
    onSubmitEdit(data.content, comment.id);
  };

  // 들여쓰기 최대 너비 설정
  const indentationWidth = Math.min(depth, 5) * 8;

  const handleReplyClick = () => {
    // depth가 10 이상일 때는 부모 댓글의 ID로 답글 달기
    const targetCommentId = comment.id;
    onReply(targetCommentId);
  };

  return (
    <div className="flex flex-col gap-4" style={{ marginLeft: `${indentationWidth}px` }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {comment.user ? (
            <p className="text-lg font-bold">{comment.user.name}</p>
          ) : (
            <p className="text-lg font-bold">익명</p>
          )}
          <p className="text-base text-gray-700">{formatDate(comment.createdAt)}</p>
        </div>
        <div className="flex h-fit items-center gap-2">
          {isLoggedIn && (
            <button onClick={handleReplyClick} className="text-base text-gray-500 hover:text-gray-700">
              답글
            </button>
          )}
          {currentUser?.id === comment.userId && (
            <>
              <button
                onClick={() => onEdit(comment.id, comment.content)}
                className="text-base text-gray-500 hover:text-gray-700"
              >
                수정
              </button>
              <button onClick={() => onDelete(comment.id)} className="text-base text-gray-500 hover:text-gray-700">
                삭제
              </button>
            </>
          )}
        </div>
      </div>

      {editCommentId === comment.id ? (
        <form onSubmit={handleEditSubmit(onEditSubmit)}>
          <textarea
            {...editRegister("content", { required: true })}
            className="w-full resize-none rounded-lg border-2 border-gray-300 p-3 text-lg"
            defaultValue={comment.content}
          />
          <div className="mt-2 flex items-center justify-end gap-2">
            <button
              type="submit"
              disabled={isEditSubmitting}
              className="rounded bg-brand-primary px-4 py-2 text-text-primary hover:bg-brand-secondary dark:hover:bg-brand_dark-secondary"
            >
              {isEditSubmitting ? "수정 중..." : "수정 완료"}
            </button>
            <button
              type="button"
              onClick={() => setEditCommentId(null)}
              className="rounded bg-gray-300 px-4 py-2 text-text-primary hover:bg-gray-400"
            >
              취소
            </button>
          </div>
        </form>
      ) : (
        <CommentContent comment={comment} />
      )}

      {replyCommentId === comment.id && (
        <form onSubmit={handleReplySubmit(onReplySubmit)} className="mt-2 flex flex-col gap-2">
          <textarea
            {...replyRegister("content", { required: true })}
            className="w-full resize-none rounded-lg border-2 border-gray-300 p-3 text-lg"
            placeholder="답글을 입력하세요. (최대 200자)"
            maxLength={200}
          />
          <div className="flex items-center justify-end gap-3">
            <p className="text-sm text-gray-500">{200 - (watch("content")?.length ?? 0)} / 200</p>
            <button
              type="submit"
              disabled={isReplySubmitting}
              className="rounded bg-brand-primary px-4 py-2 text-text-primary hover:bg-brand-secondary dark:hover:bg-brand_dark-secondary"
            >
              {isReplySubmitting ? "답글 등록 중..." : "답글 등록"}
            </button>
          </div>
        </form>
      )}

      {comment.replies?.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          depth={depth + 1}
          currentUser={currentUser}
          isLoggedIn={isLoggedIn}
          replyCommentId={replyCommentId}
          editCommentId={editCommentId}
          parentComment={depth >= 9 ? (parentComment ?? comment) : comment}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
          onSubmitReply={onSubmitReply}
          onSubmitEdit={onSubmitEdit}
          setEditCommentId={setEditCommentId}
        />
      ))}

      {depth === 0 && <div className="border-t-2 border-gray-200 pb-4" />}
    </div>
  );
}
