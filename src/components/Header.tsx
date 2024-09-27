"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { setCookie } from "cookies-next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useShallow } from "zustand/shallow";
import ThemeToggle from "./ThemeToggle";
import { getUser } from "@/services/user.api";
import useUserStore from "@/stores/UserStore";

export default function Header() {
  const queryClient = useQueryClient();
  const { isLoggedIn, setIsLoggedIn } = useUserStore(
    useShallow((state) => ({
      isLoggedIn: state.isLoggedIn,
      setIsLoggedIn: state.setIsLoggedIn,
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
  });

  const Logout = () => {
    setCookie("accessToken", "", { expires: new Date() });
    setCookie("refreshToken", "", { expires: new Date() });

    setIsLoggedIn(false);
    queryClient.clear();

    router.push("/");
  };

  if (pathname === "/blog/write") {
    return <></>;
  }

  return (
    <header className="min-h-[220px]">
      <div className="z-10 mx-auto w-full gap-6 border-b-2 border-solid border-b-gray-600 pb-6 pt-16 tablet:w-tablet desktop:w-desktop">
        <div className="flex flex-col gap-10 px-4">
          <section className="flex items-center justify-between">
            <Link href="/" className="z-20">
              <span className="text-6xl">wjsdncl Blog</span>
            </Link>

            <div className="flex items-center gap-4">
              {user ? (
                <button onClick={Logout} className="text-lg font-medium text-text-primary">
                  로그아웃
                </button>
              ) : (
                <Link href="/login" className="text-lg font-medium text-text-primary">
                  로그인
                </Link>
              )}

              <ThemeToggle />
            </div>
          </section>

          <section className="flex size-full items-center">
            <div>
              <nav>
                <ul className="mx-5 flex gap-4 text-lg font-semibold">
                  <li>
                    <Link href="/">Home</Link>
                  </li>

                  <li>
                    <Link href="/blog">Blog</Link>
                  </li>

                  <li>
                    <Link href="/about">About</Link>
                  </li>
                </ul>
              </nav>
            </div>
          </section>
        </div>
      </div>
    </header>
  );
}
