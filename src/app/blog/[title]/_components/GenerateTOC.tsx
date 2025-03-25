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
  // 헤딩 레벨 제거 (예: "## 제목" -> "제목")
  const headingText = text.replace(/^#+ /, "").trim();

  const baseId = headingText
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
  const idCountMap = useRef(new Map<string, number>()).current;

  const headings = useMemo(() => content.match(/^#{1,3}\s+([^#\n]+)$/gm) || [], [content]);
  const headingElementsRef = useRef<(HTMLHeadingElement | null)[]>([]);
  const headingIdsRef = useRef<string[]>([]);

  // 헤딩 ID 생성 및 저장
  useEffect(() => {
    // ID 맵 초기화
    idCountMap.clear();

    // 모든 헤딩에 대한 ID 생성
    const ids = headings.map((heading) => generateUniqueId(heading, idCountMap));
    headingIdsRef.current = ids;

    // DOM이 완전히 로드된 후 헤딩 요소를 찾아 ID 설정
    const applyIds = () => {
      // 레벨에 따른 헤딩 태그 선택자 생성
      const headingSelectors = [1, 2, 3].map((level) => `h${level}`).join(", ");
      const contentHeadings = Array.from(document.querySelectorAll(headingSelectors));
      const matchedHeadings: (HTMLHeadingElement | null)[] = new Array(headings.length).fill(null);

      // 각 헤딩에 ID 적용
      headings.forEach((heading, index) => {
        const headingText = heading.replace(/^#+ /, "").trim();
        const id = headingIdsRef.current[index];

        // 이미 찾은 요소는 제외하기 위한 필터링
        const availableHeadings = contentHeadings.filter((el) => !matchedHeadings.includes(el as HTMLHeadingElement));

        // 텍스트가 일치하는 헤딩 요소 찾기
        const headingElement = availableHeadings.find((el) => el.textContent?.trim() === headingText) as
          | HTMLHeadingElement
          | undefined;

        if (headingElement) {
          // ID 직접 적용 (rehypeSlug가 생성한 ID를 덮어씀)
          headingElement.id = id;
          matchedHeadings[index] = headingElement;
        }
      });

      // 참조 업데이트
      headingElementsRef.current = matchedHeadings;
    };

    // DOM이 로드된 후 IDs 적용
    setTimeout(applyIds, 100);
  }, [headings, idCountMap]);

  const handleIntersect = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const index = headingElementsRef.current.findIndex((el) => el === entry.target);
        if (index !== -1) {
          setSelectedIndex(index);
        }
      }
    });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersect, OBSERVER_OPTIONS);

    // 관찰 요소 설정 (setTimeout으로 지연 실행하여 요소가 제대로 참조되도록 함)
    const setupObserver = () => {
      headingElementsRef.current.forEach((el) => {
        if (el) observer.observe(el);
      });
    };

    setTimeout(setupObserver, 200);

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
        const id = headingIdsRef.current[index];

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
