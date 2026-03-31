"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useShallow } from "zustand/shallow";
import Github from "@/Icons/Github.svg";
import LinkIcon from "@/Icons/Link.svg";
import { revalidatePortfolios } from "@/services/actions/revalidate.action";
import { PORTFOLIO_KEYS, updatePortfolio } from "@/services/portfolio.api";
import useModalStore from "@/stores/ModalStore";
import { type PublishStatus } from "@/types/blogType";
import type { PortfolioImage, PortfolioLink } from "@/types/portfolioType";
import toast from "@/utils/toast";
import PortfolioDeleteModal from "./PortfolioDeleteModal";
import PortfolioDetailOverlay from "./PortfolioDetailOverlay";
import { TechStack } from "./PortfolioMeta";

export interface PortfolioCardProps {
  id: string;
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  summary?: string[];
  techStacks: string[];
  category?: string;
  images: PortfolioImage[];
  links: PortfolioLink[];
  status: PublishStatus;
  isOwner: boolean;
}

const usePortfolioActions = (portfolioId: string, portfolioSlug: string) => {
  const router = useRouter();
  const { openModal, closeModal } = useModalStore(
    useShallow((state) => ({ openModal: state.openModal, closeModal: state.closeModal }))
  );

  const handleEdit = () => router.push(`/portfolio/write?slug=${portfolioSlug}`);

  const handleDelete = () => {
    const modalId = openModal(
      <PortfolioDeleteModal portfolioId={portfolioId} onClose={() => modalId && closeModal(modalId)} />
    );
  };

  return { handleEdit, handleDelete };
};

export default function PortfolioCard(portfolio: PortfolioCardProps) {
  const { isOwner } = portfolio;
  const [isExpanded, setIsExpanded] = useState(false);
  const articleRef = useRef<HTMLElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const { handleEdit, handleDelete } = usePortfolioActions(portfolio.id, portfolio.slug);
  const coverImage = portfolio.images[0];
  const queryClient = useQueryClient();

  const statusToggleMutation = useMutation({
    mutationFn: async () => {
      await updatePortfolio({
        id: portfolio.id,
        portfolioData: {
          status: portfolio.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED",
        },
      });
    },
    onSuccess: async () => {
      toast.success("공개 상태가 변경되었습니다.");
      queryClient.invalidateQueries({ queryKey: PORTFOLIO_KEYS.all() });
      await revalidatePortfolios();
    },
  });

  const isPublished = portfolio.status === "PUBLISHED";

  useEffect(() => {
    document.body.style.overflow = isExpanded ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isExpanded]);

  const handleExpand = () => {
    if (!isExpanded && articleRef.current) {
      const rect = articleRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <article
      ref={articleRef}
      className="group flex flex-col overflow-hidden rounded-xl bg-gray-100 text-text-primary shadow-sm transition-shadow duration-300 hover:shadow-md"
    >
      {coverImage && (
        <div className="relative h-44 w-full overflow-hidden bg-gray-150 desktop:h-48">
          <Image
            src={coverImage.url}
            alt={`${portfolio.title} 커버 이미지`}
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          {portfolio.category && (
            <span className="rounded-full bg-brand_dark-tertiary px-2.5 py-0.5 text-xs font-semibold text-brand-quaternary">
              {portfolio.category}
            </span>
          )}
          <span>{portfolio.date}</span>
        </div>

        <div className="flex flex-col gap-2 tablet:flex-row tablet:items-center tablet:justify-between">
          <h2 className="text-xl font-bold tablet:text-2xl">{portfolio.title}</h2>

          {isOwner && (
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-gray-500">{isPublished ? "공개" : "비공개"}</span>
              <button
                type="button"
                onClick={() => !statusToggleMutation.isPending && statusToggleMutation.mutate()}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isPublished ? "bg-brand-primary" : "bg-gray-300"
                }`}
              >
                <span className="sr-only">공개 상태 변경</span>
                <span
                  className={`inline-block size-[20px] rounded-full bg-white transition-transform ${
                    isPublished ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          )}
        </div>

        {portfolio.excerpt && <p className="line-clamp-3 text-gray-700">{portfolio.excerpt}</p>}

        {portfolio.summary && portfolio.summary.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="flex w-fit items-center gap-1 rounded-full bg-brand_dark-quaternary px-2.5 py-0.5 text-xs font-semibold text-gray-700">
              ✦ AI 요약
            </span>
            <ul className="flex flex-col gap-1.5 text-sm text-gray-700">
              {portfolio.summary.map((sentence, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-0.5 text-brand-tertiary">•</span>
                  <span>{sentence}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {portfolio.techStacks.length > 0 && <TechStack stack={portfolio.techStacks} />}

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5">
            {(portfolio.links ?? [])
              .filter((l) => ["github", "live", "playstore", "appstore"].includes(l.type))
              .map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-8 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-200 hover:text-text-primary focus-visible:ring-2 focus-visible:ring-brand-tertiary"
                  aria-label={
                    link.type === "github"
                      ? "GitHub"
                      : link.type === "playstore"
                        ? "Play Store"
                        : link.type === "appstore"
                          ? "App Store"
                          : "사이트"
                  }
                >
                  {link.type === "github" ? (
                    <Github width={18} height={18} color="currentColor" />
                  ) : link.type === "playstore" ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-1.4l2.834 1.64a1 1 0 0 1 0 1.74l-2.834 1.64-2.532-2.533 2.532-2.487zM5.864 2.658L16.8 8.99l-2.302 2.302-8.635-8.635z" />
                    </svg>
                  ) : link.type === "appstore" ? (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
                      <path d="M8 16l4-8 4 8" />
                      <path d="M9.5 14h5" />
                    </svg>
                  ) : (
                    <LinkIcon width={18} height={18} color="currentColor" />
                  )}
                </a>
              ))}
          </div>
          <div className="flex items-center gap-2">
            {isOwner && (
              <>
                <button
                  onClick={handleEdit}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-200 focus-visible:ring-2 focus-visible:ring-brand-tertiary"
                >
                  수정
                </button>
                <button
                  onClick={handleDelete}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-200 focus-visible:ring-2 focus-visible:ring-brand-tertiary"
                >
                  삭제
                </button>
              </>
            )}
            <button
              onClick={handleExpand}
              className="rounded-lg bg-brand_dark-tertiary px-4 py-2 text-sm font-semibold text-brand-quaternary transition-colors hover:bg-brand_dark-secondary focus-visible:ring-2 focus-visible:ring-brand-tertiary"
            >
              자세히 보기 →
            </button>
          </div>
        </div>
      </div>

      {isExpanded &&
        createPortal(
          <PortfolioDetailOverlay
            coords={coords}
            onClose={handleExpand}
            slug={portfolio.slug}
            title={portfolio.title}
            date={portfolio.date}
            excerpt={portfolio.excerpt}
            techStacks={portfolio.techStacks}
            category={portfolio.category}
            images={portfolio.images}
            links={portfolio.links}
          />,
          document.body
        )}
    </article>
  );
}
