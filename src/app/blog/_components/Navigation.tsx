"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import useDeviceSize from "@/hooks/useDeviceSize";

interface NavigationProps {
  totalPosts: number;
  categoryCounts: Record<string, number>;
}

export default function Navigation({ totalPosts, categoryCounts }: NavigationProps) {
  const navRef = useRef<HTMLDivElement | null>(null);
  const targetPosition = useRef(0);
  const currentPosition = useRef(0);
  const [initialPosition, setInitialPosition] = useState<number | null>(null);
  const startFollowPosition = 200;
  const deviceWidth = useDeviceSize();

  useEffect(() => {
    if (navRef.current) {
      const initialTop = navRef.current.getBoundingClientRect().top + window.scrollY;
      setInitialPosition(initialTop);
      currentPosition.current = initialTop;
    }
  }, []);

  useEffect(() => {
    console.log(deviceWidth);

    if (deviceWidth !== "desktop") return;

    const updatePosition = () => {
      if (navRef.current && initialPosition !== null) {
        const distance = targetPosition.current - currentPosition.current;
        const damping = 0.05;

        currentPosition.current += distance * damping;
        navRef.current.style.transform = `translateY(${currentPosition.current - initialPosition}px)`;

        if (Math.abs(distance) > 0.5) {
          requestAnimationFrame(updatePosition);
        }
      }
    };

    const handleScroll = () => {
      if (initialPosition !== null) {
        if (window.scrollY >= startFollowPosition) {
          targetPosition.current = window.scrollY - startFollowPosition + initialPosition;
        } else {
          targetPosition.current = initialPosition;
        }
        requestAnimationFrame(updatePosition);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [deviceWidth, initialPosition]);

  return (
    <nav
      ref={navRef}
      className="-left-32 top-28 flex flex-col gap-2 text-text-primary desktop:absolute desktop:w-[110px] desktop:overflow-hidden"
    >
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
