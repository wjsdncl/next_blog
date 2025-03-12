"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import useFollowScroll from "@/hooks/useFollowScroll";
import { FavoriteEmpty, FavoriteFilled } from "@/Icons/Favorite";
import Share from "@/Icons/Share";
import { getPost, likePost, POST_TAG } from "@/services/post.api";
import type { Post } from "@/types/BlogType";
import cookies from "@/utils/cookies";
import toast from "@/utils/Toast";

const SCROLL_THRESHOLD = 200;

export default function Navigation({ title }: { title: string }) {
  // queryClient 초기화
  const queryClient = useQueryClient();

  // DOM 참조와 위치 저장
  const navRef = useFollowScroll<HTMLElement>(SCROLL_THRESHOLD);

  // 유저 로그인 여부 가져오기
  const accessToken = cookies.get("accessToken");

  // 게시물 데이터 가져오기
  const { data: post } = useQuery({
    queryKey: POST_TAG.TITLE(title),
    queryFn: () => getPost(title),
    retry: 0,
  });

  useEffect(() => {
    if (accessToken && post?.isLiked === false) {
      queryClient.invalidateQueries({ queryKey: POST_TAG.TITLE(title) });
    }
  }, [accessToken, post?.isLiked, queryClient, title]);

  // 좋아요 요청 Mutation 설정
  const LikePostMutation = useMutation({
    mutationKey: ["likePost"],
    mutationFn: async (id: number) => {
      if (!accessToken) {
        toast.error("로그인이 필요한 서비스입니다.");
        return;
      }
      await likePost(id);
    },
    onMutate: () => {
      if (!accessToken) return;
      queryClient.setQueryData(POST_TAG.TITLE(title), (oldPost: Post | undefined) =>
        oldPost ? { ...oldPost, likes: oldPost.likes + (post?.isLiked ? -1 : 1), isLiked: !post?.isLiked } : oldPost
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POST_TAG.TITLE(title) });
    },
    onError: () => {
      queryClient.setQueryData(POST_TAG.TITLE(title), (oldPost: Post | undefined) =>
        oldPost ? { ...oldPost, likes: oldPost.likes + (post?.isLiked ? -1 : 1), isLiked: !post?.isLiked } : oldPost
      );
      toast.error("좋아요 요청에 실패했습니다.");
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
    if (LikePostMutation.isPending) return;
    LikePostMutation.mutateAsync(post?.id as number);
  };

  return (
    <nav
      ref={navRef}
      className="-left-28 top-28 flex items-center gap-2 rounded-full border-gray-300 text-text-primary desktop:absolute desktop:flex-col desktop:overflow-hidden desktop:border-2 desktop:px-3 desktop:py-4"
    >
      <button type="button" onClick={handleLike}>
        <div aria-label="like" className="size-5 desktop:size-8">
          {post?.isLiked ? (
            <FavoriteFilled width={"100%"} height={"100%"} color="#656079" />
          ) : (
            <FavoriteEmpty width={"100%"} height={"100%"} color="var(--text-primary)" />
          )}
        </div>
      </button>

      <p className="font-medium">{post?.likes}</p>

      <button type="button" onClick={handleShare} className="size-5 desktop:size-8">
        <Share width={"100%"} height={"100%"} color="var(--text-primary)" />
      </button>
    </nav>
  );
}
