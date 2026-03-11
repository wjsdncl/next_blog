"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useShallow } from "zustand/shallow";
import Copy from "@/Icons/Copy.svg";
import Github from "@/Icons/Github.svg";
import Mail from "@/Icons/Mail.svg";
import { logoutUser } from "@/services/actions/revalidate.action";
import useModalStore from "@/stores/ModalStore";
import { type User } from "@/types/authType";
import cn from "@/utils/cn";
import toast from "@/utils/toast";

const HEADER_HEIGHT = 200;
const SCROLL_THRESHOLD = 0.9;

export default function ClientHeader({ user }: { user?: User }) {
  const [isSticky, setIsSticky] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const headerRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  const { openModal, closeModal } = useModalStore(
    useShallow((state) => ({
      openModal: state.openModal,
      closeModal: state.closeModal,
    }))
  );

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

  const handleLogout = async () => {
    await logoutUser();
    queryClient.clear();
    toast.success("로그아웃 되었습니다.");
    router.push("/");
  };

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

  const handleEmailClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText("wjsdncl2222@gmail.com");
    toast.success("이메일 주소가 복사되었습니다.");
  };

  const renderAuthButton = (textSize: string) =>
    user ? (
      <button onClick={openLogoutModal} className={cn(`${textSize} text-nowrap font-medium text-text-primary`)}>
        로그아웃
      </button>
    ) : (
      <Link href="/login" className={cn(`${textSize} font-medium text-text-primary`)}>
        <span className={cn("flex size-full items-center justify-center text-nowrap")}>로그인</span>
      </Link>
    );

  const renderSocialLinks = () => (
    <>
      <Link
        aria-label="GitHub Profile"
        href="https://github.com/wjsdncl"
        className={cn(`${isSticky ? "hidden tablet:flex" : "flex"} size-9 items-center justify-center p-1`)}
      >
        <Github width="90%" height="90%" color="var(--text-primary)" />
      </Link>

      <button
        aria-label="Send Email"
        className="group relative hidden size-9 items-center justify-center p-1 tablet:flex"
        onClick={handleEmailClick}
      >
        <Mail width="100%" height="100%" color="var(--text-primary)" />
        <span
          className={cn(
            "absolute -bottom-8 right-0 hidden items-center gap-2 rounded-md bg-gray-300 px-2 py-1 text-text-primary transition group-hover:flex"
          )}
          onClick={handleEmailClick}
        >
          wjsdncl2222@gmail.com <Copy width={20} height={20} color="var(--text-primary)" />
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
          <div
            className={cn(
              `flex px-5 tablet:px-0 desktop:px-5 ${isSticky ? "flex-row items-center" : "flex-col gap-6"}`
            )}
          >
            <section className={cn(`${isSticky ? "mr-8" : "flex w-full justify-between"}`)}>
              <Link href="/" className="z-20" scroll={true} onClick={() => window.scrollTo(0, 0)}>
                <span
                  className={cn(
                    `text-nowrap font-medium transition-all ${isSticky ? "text-2xl" : "text-4xl tablet:text-6xl"}`
                  )}
                >
                  wjdalswo Devlog
                </span>
              </Link>

              {!isSticky && renderAuthButton("text-lg")}
            </section>

            <section className={cn(`${isSticky ? "hidden flex-1 tablet:flex" : "flex w-full justify-between"}`)}>
              <nav>
                <ul
                  className={cn(
                    `flex size-full items-center gap-4 font-semibold ${isSticky ? "text-base" : "text-lg"}`
                  )}
                >
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
