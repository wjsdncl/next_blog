"use client";

import Link from "next/link";

import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="h-[220px]">
      <div className="z-10 mx-auto gap-6 border-b-2 border-solid border-b-gray-600 pb-6 pt-16 mobile:w-mobile tablet:w-tablet desktop:w-desktop">
        <div className="flex flex-col gap-10 px-8">
          <section className="flex flex-row items-center justify-between">
            <Link href="/" className="z-20">
              <span className="text-6xl">wjsdncl Blog</span>
            </Link>

            <div className="flex flex-row gap-4">
              <ThemeToggle />
              {/* <button className='w-20 rounded-lg border-2 border-gray-600 px-4 dark:border-gray-400'>
									로그인
								</button> */}
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
