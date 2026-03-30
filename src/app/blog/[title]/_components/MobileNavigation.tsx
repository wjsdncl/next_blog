"use client";

import { useQuery } from "@tanstack/react-query";
import useLikePost from "@/hooks/useLikePost";
import FavoriteEmpty from "@/Icons/FavoriteEmpty.svg";
import FavoriteFilled from "@/Icons/FavoriteFilled.svg";
import Share from "@/Icons/Share.svg";
import { getPost, POST_KEYS } from "@/services/post.api";
import { type User } from "@/types/authType";
import { copyCurrentUrl } from "@/utils/clipboard";

export default function MobileNavigation({ title, user }: { title: string; user?: User }) {
  const { data: post } = useQuery({
    queryKey: POST_KEYS.detail(title),
    queryFn: () => getPost(title),
  });
  const { handleLike } = useLikePost(title, user);

  return (
    <nav className="flex items-center gap-2 text-text-primary">
      <button type="button" aria-label="좋아요" onClick={() => post?.id && handleLike(post.id)} className="size-5">
        {post?.is_liked ? (
          <FavoriteFilled width="100%" height="100%" color="var(--brand-primary)" />
        ) : (
          <FavoriteEmpty width="100%" height="100%" color="var(--text-primary)" />
        )}
      </button>

      <p className="font-medium">{post?.like_count}</p>

      <button type="button" aria-label="공유" onClick={copyCurrentUrl} className="size-5">
        <Share width="100%" height="100%" color="var(--text-primary)" />
      </button>
    </nav>
  );
}
