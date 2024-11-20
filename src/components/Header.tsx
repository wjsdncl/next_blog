"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { setCookie } from "cookies-next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useShallow } from "zustand/shallow";
import GitHub from "@/Icons/Github";
import { Mail } from "@/Icons/Mail";
import { getUser } from "@/services/user.api";
import useModalStore from "@/stores/ModalStore";
import useUserStore from "@/stores/UserStore";
import cn from "@/utils/cn";
import toast from "@/utils/Toast";

// 헤더의 기본 높이와 스크롤 임계값 설정
const HEADER_HEIGHT = 200;
const SCROLL_THRESHOLD = 0.9;

export default function Header() {
  // 헤더의 고정 상태와 표시 여부를 관리하는 상태
  const [isSticky, setIsSticky] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const headerRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  // 로그인 상태 관리를 위한 Zustand 스토어 사용
  const { isLoggedIn, setIsLoggedIn } = useUserStore(
    useShallow((state) => ({
      isLoggedIn: state.isLoggedIn,
      setIsLoggedIn: state.setIsLoggedIn,
    }))
  );

  // 모달 관리를 위한 Zustand 스토어 사용
  const { openModal, closeModal } = useModalStore(
    useShallow((state) => ({
      openModal: state.openModal,
      closeModal: state.closeModal,
    }))
  );

  // 스크롤 이벤트 처리를 위한 useEffect
  useEffect(() => {
    const handleScroll = () => {
      const header = headerRef.current;
      if (!header) return;

      const headerHeight = header.offsetHeight;
      const scrolled = window.scrollY;
      const threshold = headerHeight * SCROLL_THRESHOLD;

      // 스크롤 방향에 따라 헤더 표시/숨김 처리
      setIsVisible(scrolled <= lastScrollY.current);
      setIsSticky(scrolled > threshold);
      lastScrollY.current = scrolled;
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 사용자 정보 조회를 위한 React Query 사용
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: getUser,
    enabled: isLoggedIn,
    retry: 0,
    gcTime: 0,
    initialData: () => queryClient.getQueryData(["user"]),
  });

  // 로그아웃 처리 함수
  const handleLogout = () => {
    setCookie("accessToken", "", { expires: new Date() });
    setCookie("refreshToken", "", { expires: new Date() });
    setIsLoggedIn(false);
    queryClient.clear();
    router.push("/");
  };

  // 로그아웃 모달 표시 함수
  const openLogoutModal = () => {
    const modalId = openModal(
      <>
        <h1 className="text-center text-2xl font-bold text-text-primary">로그아웃</h1>
        <p className="mt-6 text-center text-xl">로그아웃 하시겠습니까?</p>
        <div className="mt-8 flex items-center gap-4">
          <button
            className="flex-1 rounded-md bg-brand-primary py-2 text-center text-lg font-semibold text-text-primary"
            onClick={() => {
              handleLogout();
              closeModal(modalId);
            }}
          >
            로그아웃
          </button>
          <button
            className="flex-1 rounded-md bg-gray-200 py-2 text-center text-lg font-semibold text-text-primary"
            onClick={() => closeModal(modalId)}
          >
            취소
          </button>
        </div>
      </>
    );
  };

  // 이메일 클립보드 복사 처리 함수
  const handleEmailClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText("wjsdncl2222@gmail.com");
    toast.success("이메일 주소가 복사되었습니다.");
  };

  // 로그인/로그아웃 버튼 렌더링 함수
  const renderAuthButton = (textSize: string) =>
    user ? (
      <button onClick={openLogoutModal} className={cn(`${textSize} font-medium text-text-primary`)}>
        로그아웃
      </button>
    ) : (
      <Link href="/login" className={cn(`${textSize} font-medium text-text-primary`)}>
        로그인
      </Link>
    );

  // 소셜 링크 렌더링 함수
  const renderSocialLinks = () => (
    <>
      <Link href="https://github.com/wjsdncl" className="flex size-9 items-center justify-center p-1">
        <GitHub width="80%" height="80%" color="var(--text-primary)" />
      </Link>

      <button
        className="group relative flex size-9 items-center justify-center p-1"
        onClick={() => window.open("mailto:wjsdncl2222@gmail.com")}
      >
        <Mail width="100%" height="100%" color="var(--text-primary)" />
        <span
          className={cn(
            "absolute -bottom-8 right-0 hidden rounded-md bg-gray-300 px-2 py-1 text-text-primary transition group-hover:block"
          )}
          onClick={handleEmailClick}
        >
          wjsdncl2222@gmail.com
        </span>
      </button>
    </>
  );

  // 블로그 작성 페이지에서는 헤더를 표시하지 않음
  if (pathname === "/blog/write") return null;

  return (
    <>
      {/* 헤더가 고정될 때 컨텐츠가 밀리지 않도록 더미 div 추가 */}
      {isSticky && <div style={{ height: `${HEADER_HEIGHT}px` }} />}

      <header
        ref={headerRef}
        className={cn(
          `transition-all duration-300 ${
            isSticky
              ? "fixed inset-x-0 top-0 z-50 translate-y-0 border-b-2 border-solid border-b-gray-600 bg-black"
              : `max-h-[${HEADER_HEIGHT}px]`
          } ${isSticky && !isVisible ? "-translate-y-full" : "translate-y-0"}`
        )}
      >
        <div
          className={cn(
            `z-10 mx-auto w-full tablet:w-tablet desktop:w-desktop ${
              isSticky ? "py-3" : "border-b-2 border-solid border-b-gray-600 pb-6 pt-10"
            }`
          )}
        >
          {/* 헤더 내용을 감싸는 컨테이너 */}
          <div className={cn(`flex px-4 ${isSticky ? "flex-row items-center" : "flex-col gap-10"}`)}>
            {/* 로고 섹션 */}
            <section className={cn(`${isSticky ? "mr-8" : "flex w-full justify-between"}`)}>
              <Link href="/" className="z-20">
                <span className={cn(`font-medium transition-all ${isSticky ? "text-2xl" : "text-6xl"}`)}>
                  JMJ&apos;s Devlog
                </span>
              </Link>

              {!isSticky && renderAuthButton("text-lg")}
            </section>

            {/* 네비게이션 섹션 */}
            <section className={cn(`${isSticky ? "flex-1" : "flex w-full justify-between"}`)}>
              <nav>
                <ul className={cn(`flex gap-4 font-semibold ${isSticky ? "text-base" : "mx-5 text-lg"}`)}>
                  {["Home", "Blog", "Portfolio", "About"].map((item) => (
                    <li key={item}>
                      <Link href={item === "Home" ? "/" : `/${item.toLowerCase()}`}>{item}</Link>
                    </li>
                  ))}
                </ul>
              </nav>

              {!isSticky && <div className="flex items-center gap-2">{renderSocialLinks()}</div>}
            </section>

            {/* 고정 헤더일 때 표시되는 인증/소셜 섹션 */}
            {isSticky && (
              <section className={cn("ml-auto flex items-center")}>
                <div className={cn("flex items-center gap-2")}>
                  {renderAuthButton("text-base")}
                  {renderSocialLinks()}
                </div>
              </section>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
