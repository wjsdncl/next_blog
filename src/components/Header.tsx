"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { setCookie } from "cookies-next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useShallow } from "zustand/shallow";
import GitHub from "@/Icons/Github";
import { Mail } from "@/Icons/Mail";
import { getUser } from "@/services/user.api";
import useModalStore from "@/stores/ModalStore";
import useUserStore from "@/stores/UserStore";
import toast from "@/utils/Toast";

export default function Header() {
  const queryClient = useQueryClient();

  const { isLoggedIn, setIsLoggedIn } = useUserStore(
    useShallow((state) => ({
      isLoggedIn: state.isLoggedIn,
      setIsLoggedIn: state.setIsLoggedIn,
    }))
  );

  const { openModal, closeModal } = useModalStore(
    useShallow((state) => ({
      openModal: state.openModal,
      closeModal: state.closeModal,
    }))
  );

  const router = useRouter();
  const pathname = usePathname();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: getUser,
    enabled: isLoggedIn,
    retry: 0,
    gcTime: 0,
    initialData: () => {
      return queryClient.getQueryData(["user"]);
    },
  });

  const LogoutModal = () => {
    const modalId = openModal(
      <>
        <h1 className="text-center text-2xl font-bold text-text-primary">로그아웃</h1>
        <p className="mt-6 text-center text-xl">로그아웃 하시겠습니까?</p>
        <div className="mt-8 flex items-center gap-4">
          <button
            className="flex-1 rounded-md bg-brand-primary py-2 text-center text-lg font-semibold text-text-primary"
            onClick={() => {
              Logout();
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

  const Logout = () => {
    setCookie("accessToken", "", { expires: new Date() });
    setCookie("refreshToken", "", { expires: new Date() });

    setIsLoggedIn(false);
    queryClient.clear();

    router.push("/");
  };

  if (pathname === "/blog/write") {
    return null;
  }

  return (
    <header className="min-h-[220px]">
      <div className="z-10 mx-auto w-full gap-6 border-b-2 border-solid border-b-gray-600 pb-6 pt-10 tablet:w-tablet desktop:w-desktop">
        <div className="flex flex-col gap-10 px-4">
          <section className="flex items-end justify-between">
            <Link href="/" className="z-20">
              <span className="text-6xl font-medium">JMJ&apos;s Devlog</span>
            </Link>

            <div className="flex items-center gap-4">
              {user ? (
                <button onClick={LogoutModal} className="text-lg font-medium text-text-primary">
                  로그아웃
                </button>
              ) : (
                <Link href="/login" className="text-lg font-medium text-text-primary">
                  로그인
                </Link>
              )}

              {/* <ThemeToggle /> */}
            </div>
          </section>

          <section className="flex size-full items-center justify-between">
            <nav>
              <ul className="mx-5 flex gap-4 text-lg font-semibold">
                <li>
                  <Link href="/">Home</Link>
                </li>

                <li>
                  <Link href="/blog">Blog</Link>
                </li>

                <li>
                  <Link href="/portfolio">Portfolio</Link>
                </li>

                <li>
                  <Link href="/about">About</Link>
                </li>
              </ul>
            </nav>

            <div className="flex items-center gap-1">
              <Link href="https://github.com/wjsdncl" className="flex size-9 items-center justify-center p-1">
                <GitHub width={"80%"} height={"80%"} color="var(--text-primary)" />
              </Link>

              <button
                className="group relative flex size-9 items-center justify-center p-1"
                onClick={() => window.open("mailto:wjsdncl2222@gmail.com")}
              >
                <Mail width={"100%"} height={"100%"} color="var(--text-primary)" />

                <span
                  className="absolute -bottom-8 right-0 hidden rounded-md bg-gray-300 px-2 py-1 text-text-primary transition group-hover:block"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText("wjsdncl2222@gmail.com");
                    toast.success("이메일 주소가 복사되었습니다.");
                  }}
                >
                  wjsdncl2222@gmail.com
                </span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </header>
  );
}
