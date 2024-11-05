import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/shallow";
import { FavoriteEmpty, FavoriteFilled } from "@/Icons/Favorite";
import Share from "@/Icons/Share";
import { likePost } from "@/services/post.api";
import useUserStore from "@/stores/UserStore";
import { Post } from "@/types/blogType";
import toast from "@/utils/Toast";

export default function Navigation({ post }: { post: Post }) {
  // queryClient 초기화
  const queryClient = useQueryClient();

  // DOM 참조와 위치 저장
  const navRef = useRef<HTMLDivElement | null>(null);
  const targetPosition = useRef(0);
  const currentPosition = useRef(0);
  const [initialPosition, setInitialPosition] = useState<number | null>(null);

  // 스크롤 따라오는 시작 위치 설정
  const startFollowPosition = 200;
  const encodedTitle = encodeURIComponent(post.slug);

  // 유저 로그인 여부 가져오기
  const { isLoggedIn } = useUserStore(
    useShallow((state) => ({
      isLoggedIn: state.isLoggedIn,
    }))
  );

  // 좋아요 요청 Mutation 설정
  const LikePostMutation = useMutation({
    mutationKey: ["likePost"],
    mutationFn: async (id: number) => {
      if (!isLoggedIn) {
        toast.error("로그인이 필요한 서비스입니다.");
        return;
      }
      await likePost(id);
    },
    onMutate: () => {
      queryClient.setQueryData(["post", encodedTitle], (oldPost: Post | undefined) =>
        oldPost
          ? {
              ...oldPost,
              likes: oldPost.likes + (post.isLiked ? -1 : 1),
              isLiked: !post.isLiked,
            }
          : oldPost
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post", encodedTitle] });
    },
    onError: () => {
      queryClient.setQueryData(["post", encodedTitle], (oldPost: Post | undefined) =>
        oldPost
          ? {
              ...oldPost,
              likes: oldPost.likes + (post.isLiked ? -1 : 1),
              isLiked: !post.isLiked,
            }
          : oldPost
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
    LikePostMutation.mutateAsync(post.id);
  };

  // 컴포넌트 마운트 시 초기 위치 저장
  useEffect(() => {
    if (navRef.current) {
      const initialTop = navRef.current.getBoundingClientRect().top + window.scrollY;
      setInitialPosition(initialTop);
      currentPosition.current = initialTop;
    }
  }, []);

  // 스크롤 이벤트에 따라 위치 업데이트
  useEffect(() => {
    const updatePosition = () => {
      if (navRef.current && initialPosition !== null) {
        const distance = targetPosition.current - currentPosition.current;
        const damping = 0.05;

        currentPosition.current += distance * damping;
        navRef.current.style.transform = `translateY(${currentPosition.current - initialPosition}px)`;

        if (Math.abs(distance) > 0.5) {
          requestAnimationFrame(updatePosition);
        }
      }
    };

    const handleScroll = () => {
      if (initialPosition !== null) {
        if (window.scrollY >= startFollowPosition) {
          targetPosition.current = window.scrollY - startFollowPosition + initialPosition;
        } else {
          targetPosition.current = initialPosition;
        }
        requestAnimationFrame(updatePosition);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [initialPosition]);

  return (
    <nav
      ref={navRef}
      className="-left-32 top-28 flex flex-col items-center gap-2 rounded-full border-2 border-gray-300 px-3 py-4 text-text-primary desktop:absolute desktop:overflow-hidden"
    >
      <button type="button" onClick={handleLike}>
        <div aria-label="like">
          {post.isLiked ? (
            <FavoriteFilled width={36} height={36} color="#656079" />
          ) : (
            <FavoriteEmpty width={36} height={36} color="var(--text-primary)" />
          )}
        </div>
      </button>

      <p className="font-medium">{post.likes}</p>

      <button type="button" onClick={handleShare}>
        <Share width={32} height={32} color="var(--text-primary)" />
      </button>
    </nav>
  );
}
