"use client";

import Link from "next/link";

import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="min-h-[220px]">
      <div className="z-10 mx-auto w-full gap-6 border-b-2 border-solid border-b-gray-600 pb-6 pt-16 tablet:w-tablet desktop:w-desktop">
        <div className="flex flex-col gap-10 px-4">
          <section className="flex items-center justify-between">
            <Link href="/" className="z-20">
              <span className="text-6xl">wjsdncl Blog</span>
            </Link>

            <div className="flex items-center gap-4">
              <Link href={"/login"} className="text-lg font-medium text-text-primary">
                로그인
              </Link>
              <ThemeToggle />
            </div>
          </section>

          <section className="flex size-full items-center">
            <div className="">
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
