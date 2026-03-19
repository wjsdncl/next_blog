"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import components from "@/components/content/MarkdownComponents";
import { getPortfolio, PORTFOLIO_KEYS } from "@/services/portfolio.api";
import type { PortfolioImage } from "@/types/portfolioType";
import { PortfolioLinks, TechStack } from "./PortfolioMeta";

interface PortfolioDetailOverlayProps {
  coords: { top: number; width: number };
  onClose: () => void;
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  techStacks: string[];
  category?: string;
  images: PortfolioImage[];
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
}: PortfolioDetailOverlayProps) {
  const { data: portfolio, isLoading } = useQuery({
    queryKey: PORTFOLIO_KEYS.detail(slug),
    queryFn: () => getPortfolio(slug),
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const animation = isMobile
    ? "mobileExpandHorizontal 0.4s forwards, expandVertical 0.4s forwards"
    : "expandHorizontal 0.4s forwards, expandVertical 0.4s forwards";

  const displayImages = portfolio?.images ?? images;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-black_opacity-80 backdrop-blur-sm scrollbar-hide motion-reduce:animate-none"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} 상세 보기`}
    >
      <div className="flex min-h-full items-start justify-center tablet:py-12" onClick={onClose}>
        <div
          className="relative overflow-hidden bg-gray-100 motion-reduce:animate-none tablet:rounded-2xl"
          style={{
            marginTop: coords.top,
            width: coords.width,
            animation,
          }}
        >
          <div className="p-6" onClick={(e) => e.stopPropagation()}>
            {displayImages.length > 0 && (
              <div className="mb-4 flex gap-2 overflow-x-auto scrollbar-hide">
                {displayImages.map((img) => (
                  <div key={img.id} className="relative h-48 w-full shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={img.url}
                      alt={`${title} 이미지`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 768px"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="mb-4">
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-3xl font-semibold">{title}</h2>
                  {category && (
                    <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                      {category}
                    </span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="px-3 py-1 font-semibold text-brand-tertiary focus-visible:rounded focus-visible:ring-2 focus-visible:ring-brand-tertiary"
                  aria-label="닫기"
                >
                  닫기
                </button>
              </div>
              <p className="pb-3 font-medium text-gray-800">{date}</p>
              <hr className="border-t-2 border-gray-400" />
            </div>

            <div className="mb-6">
              {excerpt && (
                <div className="mb-4">
                  <h3 className="mb-2 text-2xl font-semibold"># 프로젝트 설명</h3>
                  <p className="text-lg font-medium">{excerpt}</p>
                </div>
              )}

              <hr className="my-6 border-t-2 border-gray-400" />

              <div>
                <h3 className="mb-2 text-2xl font-semibold"># 상세 내용</h3>
                {isLoading ? (
                  <div className="animate-pulse space-y-3 rounded-xl border-4 border-gray-150 p-4 tablet:px-6 tablet:py-4">
                    <div className="h-4 w-3/4 rounded bg-gray-200" />
                    <div className="h-4 w-full rounded bg-gray-200" />
                    <div className="h-4 w-5/6 rounded bg-gray-200" />
                    <div className="h-4 w-2/3 rounded bg-gray-200" />
                  </div>
                ) : (
                  <div className="prose rounded-xl border-4 border-gray-150 p-4 text-lg prose-headings:text-text-primary prose-strong:text-text-primary prose-ul:text-text-primary prose-li:p-0 tablet:px-6 tablet:py-4">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkBreaks]}
                      rehypePlugins={[rehypeSlug]}
                      components={components}
                    >
                      {portfolio?.content || ""}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <TechStack stack={techStacks} />

              <div className="flex justify-end">
                {isLoading ? (
                  <div className="flex animate-pulse gap-4">
                    <div className="h-10 w-32 rounded-md bg-gray-200" />
                    <div className="h-10 w-32 rounded-md bg-gray-200" />
                  </div>
                ) : (
                  <PortfolioLinks links={portfolio?.links || []} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
