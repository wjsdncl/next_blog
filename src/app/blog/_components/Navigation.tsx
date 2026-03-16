"use client";

import Link from "next/link";

interface NavigationProps {
  totalPosts: number;
  categories: Record<string, number>;
}

export default function Navigation({ totalPosts, categories: categoryCounts }: NavigationProps) {
  return (
    <nav className="sticky top-[90px] flex flex-col gap-2 pt-[72px] text-text-primary">
      <span className="text-2xl font-bold">카테고리</span>

      <ul className="flex gap-2 overflow-x-auto text-lg font-medium desktop:flex-col desktop:overflow-visible">
        <li>
          <Link href="/blog">
            <p className="flex items-center gap-2 whitespace-nowrap">
              <span className="grow">전체보기</span>
              <span className="shrink-0 text-sm text-gray-600">({totalPosts})</span>
            </p>
          </Link>
        </li>
        {Object.entries(categoryCounts)
          .filter(([category]) => category !== "null" && category.trim() !== "" && category !== null)
          .map(([category, count]) => (
            <li key={category}>
              <Link href={`/blog?category=${category}`}>
                <p className="flex items-center gap-2 whitespace-nowrap">
                  <span className="grow desktop:overflow-hidden desktop:text-ellipsis">{category}</span>
                  <span className="shrink-0 text-sm text-gray-600">({count})</span>
                </p>
              </Link>
            </li>
          ))}
      </ul>
    </nav>
  );
}
