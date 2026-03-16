"use client";

import FavoriteEmpty from "@/Icons/FavoriteEmpty.svg";
import FavoriteFilled from "@/Icons/FavoriteFilled.svg";
import Share from "@/Icons/Share.svg";
import { type User } from "@/types/authType";
import usePostActions from "./usePostActions";

export default function MobileNavigation({ title, user }: { title: string; user?: User }) {
  const { post, handleLike, handleShare } = usePostActions(title, user);

  return (
    <nav className="flex items-center gap-2 text-text-primary">
      <button type="button" aria-label="좋아요" onClick={handleLike} className="size-5">
        {post?.is_liked ? (
          <FavoriteFilled width="100%" height="100%" color="var(--brand-primary)" />
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
