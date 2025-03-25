"use client";

import { useMutation } from "@tanstack/react-query";
import { useRef, useState, useEffect } from "react";
import useFollowScroll from "@/hooks/useFollowScroll";
import { FavoriteEmpty, FavoriteFilled } from "@/Icons/Favorite";
import Share from "@/Icons/Share";
import { likePost } from "@/services/post.api";
import { revalidatePostList } from "@/services/server.action";
import type { Post } from "@/types/BlogType";
import cookies from "@/utils/cookies";
import toast from "@/utils/Toast";

const SCROLL_THRESHOLD = 200;

export default function Navigation({ post }: { post: Post }) {
  // DOM 참조와 위치 저장
  const navRef = useFollowScroll<HTMLElement>(SCROLL_THRESHOLD);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [isPostLiked, setIsPostLiked] = useState(post.isLiked);
  const [likesCount, setLikes] = useState(post.likes);

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
    onMutate: () => {
      setIsPostLiked((prev) => !prev);
      setLikes((prev) => (isPostLiked ? prev - 1 : prev + 1));
    },
    onSuccess: async () => {
      await revalidatePostList();
    },
    onError: (error) => {
      // AbortError는 사용자가 의도적으로 취소한 것이므로 오류 처리하지 않음
      if (error.name !== "AbortError") {
        setIsPostLiked((prev) => !prev);
        setLikes((prev) => (isPostLiked ? prev - 1 : prev + 1));
        toast.error("좋아요 요청에 실패했습니다.");
      }
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

    likePostMutation.mutate(post?.id as number);
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
        {isPostLiked ? (
          <FavoriteFilled width={"100%"} height={"100%"} color="#656079" />
        ) : (
          <FavoriteEmpty width={"100%"} height={"100%"} color="var(--text-primary)" />
        )}
      </button>

      <p className="font-medium">{likesCount}</p>

      <button type="button" aria-label="share-btn" onClick={handleShare} className="size-5 desktop:size-8">
        <Share width={"100%"} height={"100%"} color="var(--text-primary)" />
      </button>
    </nav>
  );
}
