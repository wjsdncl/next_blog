"use client";

import Link from "next/link";
import { useTheme } from "next-themes";

import Dropdown from "./Dropdown";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const label = theme === "system" ? "◑ System" : theme === "light" ? "○ Light" : "● Dark";

  return (
    <header className="min-h-[220px] bg-_white dark:bg-_black">
      <div className="z-10 mx-auto gap-6 border-b-2 border-solid border-b-_gray-600 bg-_white pb-6 pt-16 mobile:w-mobile tablet:w-tablet desktop:w-desktop dark:border-b-_gray-300 dark:bg-_black">
        <div className="flex flex-col gap-10 px-8">
          <div className="flex flex-row items-center justify-between">
            <Link href="/" className="z-20">
              <span className="text-6xl">wjsdncl Blog</span>
            </Link>

            <div className="flex flex-row gap-4">
              <Dropdown
                options={[
                  { label: "◑ System", value: "system" },
                  { label: "○ Light", value: "light" },
                  { label: "● Dark", value: "dark" },
                ]}
                placeholder={label}
                onSelect={(value) => setTheme(value)}
                showSelectedLabelAsPlaceholder
              />
              {/* <button className='w-20 rounded-lg border-2 border-gray-600 px-4 dark:border-gray-400'>
									로그인
								</button> */}
            </div>
          </div>

          <div className="flex size-full items-center">
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
          </div>
        </div>
      </div>
    </header>
  );
}
