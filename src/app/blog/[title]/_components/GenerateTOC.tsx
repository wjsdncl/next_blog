"use client";

import { useEffect, useRef, useState } from "react";
import useFollowScroll from "@/hooks/useFollowScroll";

interface GenerateTOCProps {
  content: string;
}
const SCROLL_THRESHOLD = 200;

const OBSERVER_OPTIONS = {
  rootMargin: "0px 0px -80% 0px",
  threshold: 1.0,
} as const;

const INDENT_CLASSES: { [key: string]: string } = {
  1: "ml-1",
  2: "ml-2",
  3: "ml-4",
};

/**
 * 목차를 생성하는 컴포넌트
 *
 * @param {string} content - 마크다운 내용 (# ## ### 형식의 제목들을 포함)
 * @returns {JSX.Element} 목차 컴포넌트
 * @description
 * - 마크다운 내용에서 H1-H3 제목을 추출하여 목차를 생성합니다
 * - 스크롤 시 현재 보고 있는 섹션이 하이라이트됩니다
 * - 목차 항목 클릭 시 해당 섹션으로 스무스 스크롤됩니다
 */
export default function GenerateTOC({ content }: GenerateTOCProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const tocRef = useFollowScroll<HTMLUListElement>(SCROLL_THRESHOLD);
  const headings = content.match(/^#{1,3}\s+([^#\n]+)$/gm);
  const headingElementsRef = useRef<(HTMLHeadingElement | null)[]>([]);

  useEffect(() => {
    if (!headings) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const index = headingElementsRef.current.findIndex((el) => el === entry.target);
        if (entry.isIntersecting && index !== -1) {
          setSelectedIndex(index);
        }
      });
    }, OBSERVER_OPTIONS);

    headingElementsRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [headings]);

  if (!headings) return null;

  return (
    <ul
      ref={tocRef}
      className="absolute left-[800px] top-28 mb-4 hidden w-[185px] border-l-2 border-gray-400 py-2 pl-1 text-[15px] font-light text-gray-800 desktop:block"
    >
      {headings.map((heading, index) => {
        const levelMatch = heading.match(/^#+/);
        const level = levelMatch ? levelMatch[0].length : 0;
        const text = heading.replace(/^#+ /, "").trim();
        const id = text.toLowerCase().replace(/\s+/g, "-").replace(/[()]/g, "");

        const liClass = INDENT_CLASSES[level] || "ml-1";

        const aClass = `block pb-1 hover:underline transform transition-transform duration-200 ${selectedIndex === index ? "scale-105 text-gray-900" : ""}`;

        return (
          <li
            key={index}
            className={`${liClass} leading-tight`}
            role="menuitem"
            onClick={() => {
              setSelectedIndex(index);
              document.getElementById(id)?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }}
          >
            <a href={`#${id}`} className={aClass}>
              {text}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
