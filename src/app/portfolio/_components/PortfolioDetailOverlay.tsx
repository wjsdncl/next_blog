"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import ImageCarousel from "@/components/content/ImageCarousel";
import components from "@/components/content/MarkdownComponents";
import { getPortfolio, PORTFOLIO_KEYS } from "@/services/portfolio.api";
import type { PortfolioImage, PortfolioLink } from "@/types/portfolioType";
import { PortfolioLinks, TechStack } from "./PortfolioMeta";

interface PortfolioDetailOverlayProps {
  coords: { top: number; left: number; width: number; height: number };
  onClose: () => void;
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  techStacks: string[];
  category?: string;
  images: PortfolioImage[];
  links: PortfolioLink[];
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="shrink-0 text-sm font-semibold uppercase tracking-wider text-gray-500">{label}</span>
      <div className="h-px flex-1 bg-gray-300" />
    </div>
  );
}

export default function PortfolioDetailOverlay({
  coords,
  onClose,
  slug,
  title,
  date,
  excerpt,
  techStacks,
  category,
  images,
  links,
}: PortfolioDetailOverlayProps) {
  const { data: portfolio, isLoading } = useQuery({
    queryKey: PORTFOLIO_KEYS.detail(slug),
    queryFn: () => getPortfolio(slug),
  });

  const [phase, setPhase] = useState<"initial" | "animating" | "settled">("initial");
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => setPhase("animating"));
  }, []);

  useEffect(() => {
    if (phase !== "animating") return;
    const timer = setTimeout(() => setPhase("settled"), 300);
    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const displayImages = portfolio?.images ?? images ?? [];
  const displayLinks = portfolio?.links ?? links ?? [];

  const isAnimated = phase !== "initial";

  const [animTarget] = useState(() => {
    const vw = typeof window !== "undefined" ? window.innerWidth : coords.width;
    const mobile = coords.width >= vw - 48;
    const width = mobile ? vw : Math.min(vw * 0.9, 1200);
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;
    const top = mobile ? 0 : 48;
    const targetHeight = mobile ? vh : vh - top * 2;
    return { mobile, width, left: (vw - width) / 2, top, targetHeight };
  });

  const scaleX = coords.width / animTarget.width;
  const scaleY = coords.height / animTarget.targetHeight;
  const translateX = coords.left - animTarget.left;
  const translateY = coords.top - animTarget.top;

  const panelStyle: React.CSSProperties =
    phase === "initial"
      ? {
          position: "fixed",
          top: animTarget.top,
          left: animTarget.left,
          width: animTarget.width,
          height: animTarget.targetHeight,
          borderRadius: animTarget.mobile ? 0 : 16,
          overflow: "hidden",
          transform: `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`,
          transformOrigin: "top left",
          willChange: "transform",
          transition: "none",
        }
      : phase === "animating"
        ? {
            position: "fixed",
            top: animTarget.top,
            left: animTarget.left,
            width: animTarget.width,
            height: animTarget.targetHeight,
            overflow: "hidden",
            borderRadius: animTarget.mobile ? 0 : 16,
            transform: "translate(0, 0) scale(1, 1)",
            transformOrigin: "top left",
            willChange: "transform",
            transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }
        : {};

  return (
    <div
      className={`fixed inset-0 z-50 transition-colors duration-300 ${isAnimated ? "bg-black_opacity-80" : "bg-transparent"}`}
      role="dialog"
      aria-modal="true"
      aria-label={`${title} 상세 보기`}
    >
      <button type="button" className="fixed inset-0 z-0 cursor-default" onClick={onClose} aria-label="닫기" />
      <div
        ref={panelRef}
        className={`relative z-10 overflow-y-auto overscroll-contain bg-gray-100 scrollbar-hide ${
          phase === "settled"
            ? "fixed inset-x-0 top-0 mx-auto h-dvh max-h-dvh tablet:top-12 tablet:max-h-[calc(100dvh-96px)] tablet:w-[90vw] tablet:rounded-2xl desktop:w-desktop"
            : ""
        }`}
        style={panelStyle}
      >
        {/* Sticky Header */}
        <div className="bg-gray-100/90 sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 px-6 py-3 backdrop-blur-md">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            {category && (
              <span className="rounded-full bg-brand_dark-tertiary px-2.5 py-0.5 text-xs font-semibold text-brand-quaternary">
                {category}
              </span>
            )}
            <span>{date}</span>
          </div>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-200 focus-visible:ring-2 focus-visible:ring-brand-tertiary"
            aria-label="닫기"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className={`transition-opacity delay-200 duration-300 ${isAnimated ? "opacity-100" : "opacity-0"}`}>
          {/* Hero Image Gallery */}
          {displayImages.length > 0 ? (
            <ImageCarousel images={displayImages} alt={title} className="mb-6" />
          ) : (
            <div className="pt-6" />
          )}

          <div className="px-6 pb-6">
            {/* Title + Excerpt + TechStack + Links */}
            <div className="mb-6">
              <h2 className="text-balance text-2xl font-bold tablet:text-3xl">{title}</h2>
              {excerpt && <p className="mt-2 text-lg text-gray-700">{excerpt}</p>}
              {techStacks.length > 0 && (
                <div className="mt-4">
                  <TechStack stack={techStacks} />
                </div>
              )}
              {displayLinks.length > 0 && (
                <div className="mt-4">
                  <PortfolioLinks links={displayLinks} />
                </div>
              )}
            </div>

            {/* Detail Content */}
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="size-6 animate-spin rounded-full border-2 border-gray-300 border-t-brand-tertiary" />
              </div>
            ) : (
              portfolio?.content && (
                <>
                  <SectionDivider label="상세 내용" />
                  <div className="prose py-4 text-lg prose-headings:text-text-primary prose-strong:text-text-primary prose-ul:text-text-primary prose-li:p-0">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkBreaks]}
                      rehypePlugins={[rehypeSlug]}
                      components={components}
                    >
                      {portfolio.content}
                    </ReactMarkdown>
                  </div>
                </>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
