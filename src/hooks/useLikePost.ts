"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useEffect } from "react";
import { likePost, POST_KEYS } from "@/services/post.api";
import type { User } from "@/types/authType";
import type { Post } from "@/types/blogType";
import toast from "@/utils/toast";

export default function useLikePost(slug: string, user?: User) {
  const abortControllerRef = useRef<AbortController | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
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
      await queryClient.cancelQueries({ queryKey: POST_KEYS.detail(slug) });

      const previousPost = queryClient.getQueryData<Post>(POST_KEYS.detail(slug));

      if (previousPost) {
        queryClient.setQueryData<Post>(POST_KEYS.detail(slug), {
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
          queryClient.setQueryData(POST_KEYS.detail(slug), context.previousPost);
        }
        toast.error("좋아요 요청에 실패했습니다.");
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: POST_KEYS.detail(slug) });
    },
  });

  const handleLike = (postId: string) => {
    if (!user) {
      toast.error("로그인 후 이용할 수 있습니다.");
      return;
    }
    mutation.mutate(postId);
  };

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { handleLike };
}
