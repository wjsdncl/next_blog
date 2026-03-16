"use client";

import FavoriteEmpty from "@/Icons/FavoriteEmpty.svg";
import FavoriteFilled from "@/Icons/FavoriteFilled.svg";
import Share from "@/Icons/Share.svg";
import { type User } from "@/types/authType";
import usePostActions from "./usePostActions";

export default function DesktopNavigation({ title, user }: { title: string; user?: User }) {
  const { post, handleLike, handleShare } = usePostActions(title, user);

  return (
    <nav className="sticky top-[90px] mt-32 flex h-fit flex-col items-center gap-2 rounded-full border-2 border-gray-300 px-3 py-4 text-text-primary">
      <button type="button" aria-label="좋아요" onClick={handleLike} className="size-8">
        {post?.is_liked ? (
          <FavoriteFilled width="100%" height="100%" color="var(--brand-primary)" />
        ) : (
          <FavoriteEmpty width="100%" height="100%" color="var(--text-primary)" />
        )}
      </button>

      <p className="font-medium">{post?.like_count}</p>

      <button type="button" aria-label="공유" onClick={handleShare} className="size-8">
        <Share width="100%" height="100%" color="var(--text-primary)" />
      </button>
    </nav>
  );
}
