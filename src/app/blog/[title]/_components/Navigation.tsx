"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useEffect } from "react";
import useFollowScroll from "@/hooks/useFollowScroll";
import FavoriteEmpty from "@/Icons/FavoriteEmpty.svg";
import FavoriteFilled from "@/Icons/FavoriteFilled.svg";
import Share from "@/Icons/Share.svg";
import { getPost, likePost, POST_TAG } from "@/services/post.api";
import type { Post } from "@/types/BlogType";
import cookies from "@/utils/cookies";
import toast from "@/utils/Toast";

const SCROLL_THRESHOLD = 200;

export default function Navigation({ title }: { title: string }) {
  // DOM 참조와 위치 저장
  const navRef = useFollowScroll<HTMLElement>(SCROLL_THRESHOLD);
  const abortControllerRef = useRef<AbortController | null>(null);
  const queryClient = useQueryClient();

  const { data: post } = useQuery({
    queryKey: POST_TAG.TITLE(title),
    queryFn: async () => {
      return await getPost(title);
    },
  });

  const accessToken = cookies.get("accessToken");

  // 좋아요 요청 Mutation 설정
  const likePostMutation = useMutation({
    mutationFn: async (id: number) => {
      // 이전 요청이 있으면 취소
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // 새로운 AbortController 생성
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const result = await likePost(id, abortController.signal);
      abortControllerRef.current = null;
      return result;
    },
    onMutate: async () => {
      // 이전 쿼리를 취소하여 낙관적 업데이트가 덮어쓰이지 않도록 함
      await queryClient.cancelQueries({ queryKey: POST_TAG.TITLE(title) });

      // 현재 상태를 저장
      const previousPost = queryClient.getQueryData<Post>(POST_TAG.TITLE(title));

      // 낙관적으로 캐시 업데이트
      if (previousPost) {
        queryClient.setQueryData<Post>(POST_TAG.TITLE(title), {
          ...previousPost,
          isLiked: !previousPost.isLiked,
          likes: previousPost.isLiked ? previousPost.likes - 1 : previousPost.likes + 1,
        });
      }

      // 롤백을 위해 이전 상태 반환
      return { previousPost };
    },
    onError: (error, _, context) => {
      // AbortError는 사용자가 의도적으로 취소한 것이므로 오류 처리하지 않음
      if (error.name !== "AbortError") {
        // 실패 시 이전 상태로 롤백
        if (context?.previousPost) {
          queryClient.setQueryData(POST_TAG.TITLE(title), context.previousPost);
        }
        toast.error("좋아요 요청에 실패했습니다.");
      }
    },
    onSettled: () => {
      // 최종 상태 확인을 위해 쿼리 무효화 (필요한 경우)
      queryClient.invalidateQueries({ queryKey: POST_TAG.TITLE(title) });
    },
  });

  // 공유 버튼 클릭 핸들러
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(decodeURIComponent(window.location.href));
      toast.success("링크가 클립보드에 복사되었습니다.");
    } catch (err) {
      toast.error("링크 복사에 실패했습니다.");
    }
  };

  // 좋아요 버튼 클릭 핸들러
  const handleLike = () => {
    if (!accessToken) {
      toast.error("로그인 후 이용할 수 있습니다.");
      return;
    }

    if (post?.id) {
      likePostMutation.mutate(post.id);
    }
  };

  // 컴포넌트 언마운트 시 요청 취소
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
      className="-left-28 top-28 flex items-center gap-2 rounded-full border-gray-300 text-text-primary desktop:absolute desktop:flex-col desktop:overflow-hidden desktop:border-2 desktop:px-3 desktop:py-4"
    >
      <button type="button" aria-label="like-btn" onClick={handleLike} className="size-5 desktop:size-8">
        {post?.isLiked ? (
          <FavoriteFilled width={"100%"} height={"100%"} color="#656079" />
        ) : (
          <FavoriteEmpty width={"100%"} height={"100%"} color="var(--text-primary)" />
        )}
      </button>

      <p className="font-medium">{post?.likes}</p>

      <button type="button" aria-label="share-btn" onClick={handleShare} className="size-5 desktop:size-8">
        <Share width={"100%"} height={"100%"} color="var(--text-primary)" />
      </button>
    </nav>
  );
}
