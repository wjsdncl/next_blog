"use client";

import useFollowScroll from "@/hooks/useFollowScroll";
import FavoriteEmpty from "@/Icons/FavoriteEmpty.svg";
import FavoriteFilled from "@/Icons/FavoriteFilled.svg";
import Share from "@/Icons/Share.svg";
import { type User } from "@/types/authType";
import usePostActions from "./usePostActions";

const SCROLL_THRESHOLD = 200;
const HEADER_OFFSET = 60;

export default function DesktopNavigation({ title, user }: { title: string; user?: User }) {
  const navRef = useFollowScroll<HTMLElement>(SCROLL_THRESHOLD, 0.1, HEADER_OFFSET);
  const { post, handleLike, handleShare } = usePostActions(title, user);

  return (
    <nav
      ref={navRef}
      className="flex flex-col items-center gap-2 rounded-full border-2 border-gray-300 px-3 py-4 text-text-primary"
    >
      <button type="button" aria-label="좋아요" onClick={handleLike} className="size-8">
        {post?.is_liked ? (
          <FavoriteFilled width="100%" height="100%" color="#656079" />
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
