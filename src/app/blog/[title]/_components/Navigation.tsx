"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useEffect } from "react";
import useFollowScroll from "@/hooks/useFollowScroll";
import FavoriteEmpty from "@/Icons/FavoriteEmpty.svg";
import FavoriteFilled from "@/Icons/FavoriteFilled.svg";
import Share from "@/Icons/Share.svg";
import { getPost, likePost, POST_KEYS } from "@/services/post.api";
import { getUser, USER_KEYS } from "@/services/user.api";
import type { Post } from "@/types/blogType";
import toast from "@/utils/toast";

const SCROLL_THRESHOLD = 200;

export default function Navigation({ title }: { title: string }) {
  const navRef = useFollowScroll<HTMLElement>(SCROLL_THRESHOLD);
  const abortControllerRef = useRef<AbortController | null>(null);
  const queryClient = useQueryClient();

  const { data: post } = useQuery({
    queryKey: POST_KEYS.detail(title),
    queryFn: async () => {
      return await getPost(title);
    },
  });

  const { data: user } = useQuery({
    queryKey: [...USER_KEYS],
    queryFn: getUser,
    retry: 0,
    staleTime: 1000 * 60 * 5,
  });

  const likePostMutation = useMutation({
    mutationFn: async (id: string) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const result = await likePost(id, abortController.signal);
      abortControllerRef.current = null;
      return result;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: POST_KEYS.detail(title) });

      const previousPost = queryClient.getQueryData<Post>(POST_KEYS.detail(title));

      if (previousPost) {
        queryClient.setQueryData<Post>(POST_KEYS.detail(title), {
          ...previousPost,
          is_liked: !previousPost.is_liked,
          like_count: previousPost.is_liked ? previousPost.like_count - 1 : previousPost.like_count + 1,
        });
      }

      return { previousPost };
    },
    onError: (error, _, context) => {
      if (error.name !== "AbortError") {
        if (context?.previousPost) {
          queryClient.setQueryData(POST_KEYS.detail(title), context.previousPost);
        }
        toast.error("좋아요 요청에 실패했습니다.");
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: POST_KEYS.detail(title) });
    },
  });

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(decodeURIComponent(window.location.href));
      toast.success("링크가 클립보드에 복사되었습니다.");
    } catch (err) {
      toast.error("링크 복사에 실패했습니다.");
    }
  };

  const handleLike = () => {
    if (!user) {
      toast.error("로그인 후 이용할 수 있습니다.");
      return;
    }

    if (post?.id) {
      likePostMutation.mutate(post.id);
    }
  };

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <nav
      ref={navRef}
      className="flex items-center gap-2 rounded-full border-gray-300 pt-[72px] text-text-primary desktop:flex-col desktop:border-2 desktop:px-3 desktop:py-4"
    >
      <button type="button" aria-label="like-btn" onClick={handleLike} className="size-5 desktop:size-8">
        {post?.is_liked ? (
          <FavoriteFilled width={"100%"} height={"100%"} color="#656079" />
        ) : (
          <FavoriteEmpty width={"100%"} height={"100%"} color="var(--text-primary)" />
        )}
      </button>

      <p className="font-medium">{post?.like_count}</p>

      <button type="button" aria-label="share-btn" onClick={handleShare} className="size-5 desktop:size-8">
        <Share width={"100%"} height={"100%"} color="var(--text-primary)" />
      </button>
    </nav>
  );
}
