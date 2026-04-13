"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import CloseIcon from "@/Icons/Close.svg";

type ImageItem = string | { url: string; id?: string | number };

interface ImageCarouselProps {
  images: ImageItem[];
  alt?: string;
  height?: string;
  objectFit?: "contain" | "cover";
  className?: string;
  columns?: 1 | 2;
}

function resolveUrl(item: ImageItem): string {
  return typeof item === "string" ? item : item.url;
}

function resolveKey(item: ImageItem, index: number): string | number {
  if (typeof item === "string") return index;
  return item.id ?? index;
}

function EnlargedModal({
  images,
  currentIndex,
  onClose,
}: {
  images: ImageItem[];
  currentIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(currentIndex);

  const goPrev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
  const goNext = useCallback(() => setIndex((i) => Math.min(images.length - 1, i + 1)), [images.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      e.stopImmediatePropagation();
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handleKey, true);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKey, true);
      document.body.style.overflow = "";
    };
  }, [onClose, goPrev, goNext]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black_opacity-80 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        className="absolute right-4 top-4 z-10 rounded-full p-2 transition-colors hover:bg-gray-400"
        onClick={onClose}
        aria-label="닫기"
      >
        <CloseIcon width={28} height={28} color="white" />
      </button>

      <div className="group relative flex w-[85vw] flex-col items-center" onClick={(e) => e.stopPropagation()}>
        <div className="relative h-[78vh] w-full rounded-lg bg-black_opacity-40">
          <Image
            src={resolveUrl(images[index])}
            alt={`이미지 ${index + 1}`}
            fill
            className="rounded-lg bg-gray-150 object-contain p-5"
            sizes="85vw"
          />

          {/* Prev */}
          {images.length > 1 && (
            <button
              className="absolute left-0 top-0 z-10 flex h-full w-16 items-center justify-center rounded-l-lg text-gray-600 transition-all hover:bg-gradient-to-r hover:from-black_opacity-40 hover:to-transparent hover:text-white focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white disabled:cursor-not-allowed disabled:text-gray-200 disabled:hover:from-transparent"
              onClick={goPrev}
              disabled={index === 0}
              aria-label="이전 이미지"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="transition-transform [button:not(:disabled):hover_&]:scale-125"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Next */}
          {images.length > 1 && (
            <button
              className="absolute right-0 top-0 z-10 flex h-full w-16 items-center justify-center rounded-r-lg text-gray-600 transition-all hover:bg-gradient-to-l hover:from-black_opacity-40 hover:to-transparent hover:text-white focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white disabled:cursor-not-allowed disabled:text-gray-200 disabled:hover:from-transparent"
              onClick={goNext}
              disabled={index === images.length - 1}
              aria-label="다음 이미지"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="transition-transform [button:not(:disabled):hover_&]:scale-125"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        {/* Counter */}
        <div className="mt-4 rounded-full px-4 py-1.5 text-sm font-medium text-gray-800">
          {index + 1} / {images.length}
        </div>
      </div>
    </div>
  );
}

export default function ImageCarousel({
  images,
  alt = "이미지",
  height = "h-64 tablet:h-96",
  objectFit = "contain",
  className = "",
  columns = 1,
}: ImageCarouselProps) {
  const [activePage, setActivePage] = useState(0);
  const [enlargedIndex, setEnlargedIndex] = useState<number | null>(null);
  const [slidesPerView, setSlidesPerView] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (columns === 1) {
      setSlidesPerView(1);
      return;
    }
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setSlidesPerView(mq.matches ? 2 : 1);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [columns]);

  const pageCount = Math.ceil(images.length / slidesPerView);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setActivePage(Math.round(el.scrollLeft / el.clientWidth));
  }, []);

  const scrollToPage = useCallback((page: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: page * el.clientWidth, behavior: "smooth" });
    setActivePage(page);
  }, []);

  const slideWidthClass = columns === 2 ? "w-full tablet:w-1/2" : "w-full";

  if (images.length === 0) return null;

  return (
    <div className={className}>
      <div className="group/carousel relative">
        {/* Scroll container */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex snap-x snap-mandatory overflow-x-auto scrollbar-hide"
        >
          {images.map((img, i) => (
            <div
              key={resolveKey(img, i)}
              className={`${height} ${slideWidthClass} shrink-0 snap-start ${columns === 2 ? "tablet:p-1.5" : ""}`}
            >
              <div
                className={`relative size-full cursor-pointer bg-gray-150 ${columns === 2 ? "tablet:overflow-hidden tablet:rounded-lg" : ""}`}
                onClick={() => setEnlargedIndex(i)}
              >
                <Image
                  src={resolveUrl(img)}
                  alt={`${alt} ${i + 1}`}
                  fill
                  className={objectFit === "contain" ? "object-contain" : "object-cover"}
                  sizes={columns === 2 ? "(max-width: 768px) 100vw, 500px" : "(max-width: 768px) 100vw, 1000px"}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Nav buttons */}
        {pageCount > 1 && (
          <>
            <button
              type="button"
              onClick={() => scrollToPage(activePage - 1)}
              disabled={activePage === 0}
              className="absolute left-0 top-0 flex h-full w-14 items-center justify-center text-gray-700 opacity-0 transition-all hover:bg-gradient-to-r hover:from-black_opacity-10 hover:to-transparent focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-tertiary disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:from-transparent group-hover/carousel:opacity-100 [&:not(:disabled)]:hover:text-gray-900"
              aria-label="이전 이미지"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform [button:not(:disabled):hover_&]:scale-125"
              >
                <path d="M10 3l-5 5 5 5" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scrollToPage(activePage + 1)}
              disabled={activePage === pageCount - 1}
              className="absolute right-0 top-0 flex h-full w-14 items-center justify-center text-gray-700 opacity-0 transition-all hover:bg-gradient-to-l hover:from-black_opacity-10 hover:to-transparent focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-tertiary disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:from-transparent group-hover/carousel:opacity-100 [&:not(:disabled)]:hover:text-gray-900"
              aria-label="다음 이미지"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform [button:not(:disabled):hover_&]:scale-125"
              >
                <path d="M6 3l5 5-5 5" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Dot indicators */}
      {pageCount > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollToPage(i)}
              className={`size-2 rounded-full transition-colors ${i === activePage ? "bg-brand-tertiary" : "bg-gray-400"}`}
              aria-label={`페이지 ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Enlarged modal */}
      {enlargedIndex !== null &&
        createPortal(
          <EnlargedModal images={images} currentIndex={enlargedIndex} onClose={() => setEnlargedIndex(null)} />,
          document.body
        )}
    </div>
  );
}
