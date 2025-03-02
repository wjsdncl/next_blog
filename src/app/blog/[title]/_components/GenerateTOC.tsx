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
 * 주어진 텍스트에서 특수문자를 제거하고 고유한 ID를 생성합니다.
 *
 * @param {string} text - ID를 생성할 텍스트
 * @param {Map<string, number>} idCountMap - ID 중복 카운트를 추적하는 Map
 * @returns {string} 생성된 고유 ID
 */
const generateUniqueId = (text: string, idCountMap: Map<string, number>): string => {
  const baseId = text
    .replace(/^#+ /, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9ㄱ-ㅎㅏ-ㅣ가-힣\s-]/g, "")
    .replace(/\s+/g, "-");

  // 현재 ID의 출현 횟수를 가져옴
  const count = idCountMap.get(baseId) || 0;
  // 현재 ID의 출현 횟수를 증가
  idCountMap.set(baseId, count + 1);

  // 첫 번째 출현이면 그대로 사용, 중복이면 숫자 추가
  return count === 0 ? baseId : `${baseId}-${count}`;
};

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

  // ID 중복을 추적하기 위한 Map
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const idCountMap = useMemo(() => new Map<string, number>(), [headings]);

  useEffect(() => {
    headingElementsRef.current = headings.map((heading) => {
      const id = generateUniqueId(heading, idCountMap);
      return document.getElementById(id) as HTMLHeadingElement | null;
    });
  }, [headings, idCountMap]);

  const handleIntersect = useCallback((entries: IntersectionObserverEntry[]) => {
    for (const entry of entries) {
      const index = headingElementsRef.current.findIndex((el) => el === entry.target);
      if (entry.isIntersecting && index !== -1) {
        setSelectedIndex(index);
      }
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersect, OBSERVER_OPTIONS);
    for (const el of headingElementsRef.current) {
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [handleIntersect]);

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
        const id = generateUniqueId(heading, idCountMap);

        const liClass = INDENT_CLASSES[level] || "ml-1";
        const aClass = `block pb-1 hover:underline transition-transform duration-200 ${
          selectedIndex === index ? "scale-105 text-text-primary font-normal" : ""
        }`;

        return (
          <li
            key={id}
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
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelectedIndex(index);

                const targetElement = document.getElementById(id);
                if (targetElement) {
                  const yOffset = window.innerHeight * 0.2;
                  const y = targetElement.getBoundingClientRect().top + window.scrollY - yOffset;
                  window.scrollTo({ top: y, behavior: "smooth" });
                }
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
