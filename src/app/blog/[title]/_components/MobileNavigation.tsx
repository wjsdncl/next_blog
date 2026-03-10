"use client";

import FavoriteEmpty from "@/Icons/FavoriteEmpty.svg";
import FavoriteFilled from "@/Icons/FavoriteFilled.svg";
import Share from "@/Icons/Share.svg";
import usePostActions from "./usePostActions";

export default function MobileNavigation({ title }: { title: string }) {
  const { post, handleLike, handleShare } = usePostActions(title);

  return (
    <nav className="flex items-center gap-2 text-text-primary">
      <button type="button" aria-label="좋아요" onClick={handleLike} className="size-5">
        {post?.is_liked ? (
          <FavoriteFilled width="100%" height="100%" color="#656079" />
        ) : (
          <FavoriteEmpty width="100%" height="100%" color="var(--text-primary)" />
        )}
      </button>

      <p className="font-medium">{post?.like_count}</p>

      <button type="button" aria-label="공유" onClick={handleShare} className="size-5">
        <Share width="100%" height="100%" color="var(--text-primary)" />
      </button>
    </nav>
  );
}
