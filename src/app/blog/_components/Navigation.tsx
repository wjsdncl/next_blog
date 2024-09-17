"use client";

import Link from "next/link";

export default function Navigation() {
  return (
    <nav className="-left-32 top-28 flex w-[110px] flex-col gap-2 overflow-hidden text-text-primary desktop:absolute">
      <span className="text-2xl font-bold">카테고리</span>

      <ul className="flex gap-2 text-lg font-medium desktop:flex-col">
        <li className="">
          <Link href="/blog">
            <p className="flex items-center gap-2 whitespace-nowrap">
              <span className="grow overflow-hidden text-ellipsis">전체보기</span>
              <span className="shrink-0 text-sm text-gray-600">(10)</span>
            </p>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
