"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";

interface GenerateTOCProps {
  content: string;
}
const OBSERVER_OPTIONS = {
  rootMargin: "0px 0px -70% 0px",
  threshold: 1,
} as const;

const INDENT_CLASSES: { [key: string]: string } = {
  1: "",
  2: "ml-3",
  3: "ml-6",
};

/** 헤딩 텍스트에서 특수문자를 제거하고 중복 시 숫자를 붙여 고유 ID 생성 */
const generateUniqueId = (text: string, idCountMap: Map<string, number>): string => {
  const headingText = text.replace(/^#+ /, "").trim();

  const baseId = headingText
    .toLowerCase()
    .replace(/[^a-z0-9ㄱ-ㅎㅏ-ㅣ가-힣\s-]/g, "")
    .replace(/\s+/g, "-");

  const count = idCountMap.get(baseId) || 0;
  idCountMap.set(baseId, count + 1);

  return count === 0 ? baseId : `${baseId}-${count}`;
};

export default function GenerateTOC({ content }: GenerateTOCProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const idCountMap = useRef(new Map<string, number>()).current;

  const headings = useMemo(() => content.match(/^#{1,3}\s+([^#\n]+)$/gm) || [], [content]);
  const headingElementsRef = useRef<(HTMLHeadingElement | null)[]>([]);
  const headingIdsRef = useRef<string[]>([]);

  useEffect(() => {
    idCountMap.clear();
    const ids = headings.map((heading) => generateUniqueId(heading, idCountMap));
    headingIdsRef.current = ids;

    // DOM 로드 후 헤딩 요소에 ID 적용
    const applyIds = () => {
      const headingSelectors = [1, 2, 3].map((level) => `h${level}`).join(", ");
      const contentHeadings = Array.from(document.querySelectorAll(headingSelectors));
      const matchedHeadings: (HTMLHeadingElement | null)[] = new Array(headings.length).fill(null);

      headings.forEach((heading, index) => {
        const headingText = heading.replace(/^#+ /, "").trim();
        const id = headingIdsRef.current[index];

        const availableHeadings = contentHeadings.filter((el) => !matchedHeadings.includes(el as HTMLHeadingElement));
        const headingElement = availableHeadings.find((el) => el.textContent?.trim() === headingText) as
          | HTMLHeadingElement
          | undefined;

        if (headingElement) {
          headingElement.id = id;
          matchedHeadings[index] = headingElement;
        }
      });

      headingElementsRef.current = matchedHeadings;
    };

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

    // setTimeout으로 지연 실행하여 요소가 제대로 참조되도록 함
    const setupObserver = () => {
      headingElementsRef.current.forEach((el) => {
        if (el) observer.observe(el);
      });
    };

    setTimeout(setupObserver, 200);

    return () => observer.disconnect();
  }, [handleIntersect]);

  const handleItemClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, index: number, id: string) => {
    e.preventDefault();
    setSelectedIndex(index);

    const targetElement = document.getElementById(id);
    if (targetElement) {
      const yOffset = window.innerHeight * 0.2;
      const y = targetElement.getBoundingClientRect().top + window.scrollY - yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });

      // 스크롤 후 포커스 이동 (접근성 개선)
      setTimeout(() => {
        targetElement.tabIndex = -1;
        targetElement.focus({ preventScroll: true });
      }, 500);
    }
  }, []);

  if (!headings.length) return null;

  return (
    <nav
      aria-label="목차"
      className="toc-scroll sticky top-[90px] mb-4 mt-32 max-h-[calc(100vh-80px)] overflow-y-auto overflow-x-hidden border-l-2 border-gray-400 px-3 py-4 text-[15px] font-light text-gray-800"
    >
      <h2 className="sr-only">글 목차</h2>
      <ul>
        {headings.map((heading, index) => {
          const levelMatch = heading.match(/^#+/);
          const level = levelMatch ? levelMatch[0].length : 0;
          const text = heading.replace(/^#+ /, "").trim();
          const id = headingIdsRef.current[index] || `heading-${index}`;
          const isSelected = selectedIndex === index;

          const liClass = INDENT_CLASSES[level] || "";
          const aClass = `block break-words pb-1.5 hover:underline transition-transform duration-200 ${
            isSelected ? "scale-105 text-text-primary font-normal" : ""
          }`;

          return (
            <li key={`toc-item-${index}-${id}`} className={`${liClass} leading-tight`}>
              <a
                href={`#${id}`}
                className={aClass}
                onClick={(e) => handleItemClick(e, index, id)}
                aria-current={isSelected ? "true" : undefined}
                aria-label={`목차 항목: ${text}, 레벨 ${level}`}
              >
                {text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
