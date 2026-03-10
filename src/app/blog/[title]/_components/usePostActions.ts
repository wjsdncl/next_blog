"use client";

import { useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getPost, likePost, POST_KEYS } from "@/services/post.api";
import type { Post } from "@/types/blogType";
import toast from "@/utils/toast";

export default function usePostActions(title: string) {
  const abortControllerRef = useRef<AbortController | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: post } = useQuery({
    queryKey: POST_KEYS.detail(title),
    queryFn: () => getPost(title),
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
    } catch {
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

  return { post, handleLike, handleShare };
}
