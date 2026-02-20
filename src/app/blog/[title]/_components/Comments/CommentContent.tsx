import { useState } from "react";
import { type Comment } from "@/types/blogType";

export default function CommentContent({ comment }: { comment: Comment }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isLongComment = comment.content.split("\n").length > 3;

  return (
    <div className="size-full">
      <p className="whitespace-pre-line text-lg text-text-primary">
        {isExpanded || !isLongComment ? comment.content : comment.content.split("\n").slice(0, 3).join("\n") + "..."}
      </p>

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
