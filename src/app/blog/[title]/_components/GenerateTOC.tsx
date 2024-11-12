"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import useFollowScroll from "@/hooks/useFollowScroll";

interface GenerateTOCProps {
  content: string;
}
const SCROLL_THRESHOLD = 200;

const OBSERVER_OPTIONS = {
  rootMargin: "0px 0px -70% 0px",
  threshold: 1,
} as const;

const INDENT_CLASSES: { [key: string]: string } = {
  1: "ml-1",
  2: "ml-2",
  3: "ml-4",
};

/**
 * 주어진 텍스트에서 특수문자를 제거하고 ID를 생성합니다.
 *
 * @param {string} text - ID를 생성할 텍스트
 * @returns {string} 생성된 ID
 */
const generateId = (text: string): string =>
  text
    .replace(/^#+ /, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9ㄱ-ㅎㅏ-ㅣ가-힣\s-]/g, "") // 특수문자 제거
    .replace(/\s+/g, "-"); // 공백을 하이픈으로 변환

/**
 * 목차를 생성하는 컴포넌트
 *
 * @param {string} content - 마크다운 내용 (# ## ### 형식의 제목들을 포함)
 * @returns {JSX.Element} 목차 컴포넌트
 */
export default function GenerateTOC({ content }: GenerateTOCProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const tocRef = useFollowScroll<HTMLUListElement>(SCROLL_THRESHOLD);

  const headings = useMemo(() => content.match(/^#{1,3}\s+([^#\n]+)$/gm) || [], [content]);

  const headingElementsRef = useRef<(HTMLHeadingElement | null)[]>([]);

  useEffect(() => {
    headingElementsRef.current = headings.map((heading) => {
      const id = generateId(heading);
      return document.getElementById(id) as HTMLHeadingElement | null;
    });
  }, [headings]);

  const handleIntersect = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      const index = headingElementsRef.current.findIndex((el) => el === entry.target);
      if (entry.isIntersecting && index !== -1) {
        setSelectedIndex(index);
      }
    });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersect, OBSERVER_OPTIONS);
    headingElementsRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings, handleIntersect]);

  if (!headings.length) return null;

  return (
    <ul
      ref={tocRef}
      className="absolute left-[800px] top-28 mb-4 hidden w-[185px] border-l-2 border-gray-400 py-2 pl-1 text-[15px] font-light text-gray-800 desktop:block"
    >
      {headings.map((heading, index) => {
        const levelMatch = heading.match(/^#+/);
        const level = levelMatch ? levelMatch[0].length : 0;
        const text = heading.replace(/^#+ /, "").trim();
        const id = generateId(heading);

        const liClass = INDENT_CLASSES[level] || "ml-1";
        const aClass = `block pb-1 hover:underline transition-transform duration-200 ${
          selectedIndex === index ? "scale-105 text-text-primary font-normal" : ""
        }`;

        return (
          <li
            key={index}
            className={`${liClass} leading-tight`}
            role="menuitem"
            onClick={(e) => {
              e.preventDefault();
              setSelectedIndex(index);

              const targetElement = document.getElementById(id);
              if (targetElement) {
                const yOffset = window.innerHeight * 0.2;
                const y = targetElement.getBoundingClientRect().top + window.scrollY - yOffset;
                window.scrollTo({ top: y, behavior: "smooth" });
              }
            }}
          >
            <a
              href={`#${id}`}
              className={aClass}
              aria-current={selectedIndex === index ? "true" : undefined}
              aria-label={`목차 항목: ${text}`}
            >
              {text}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
