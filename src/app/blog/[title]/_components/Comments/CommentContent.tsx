import { useState } from "react";
import { Comment } from "@/types/blogType";

export default function CommentContent({ comment }: { comment: Comment }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // 3줄 이상인지 확인하는 함수
  const isLongComment = comment.content.split("\n").length > 3;

  return (
    <div className="size-full">
      {/* 댓글 내용 */}
      <p className="whitespace-pre-line text-lg text-text-primary">
        {isExpanded || !isLongComment ? comment.content : comment.content.split("\n").slice(0, 3).join("\n") + "..."}
      </p>

      {/* "더 보기" 또는 "접기" 버튼 */}
      {isLongComment && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-8 w-full rounded-b-md bg-gray-200 text-text-primary"
        >
          {isExpanded ? "접기" : "더 보기"}
        </button>
      )}
    </div>
  );
}
