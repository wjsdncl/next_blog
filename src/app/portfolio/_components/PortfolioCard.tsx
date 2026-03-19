"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useShallow } from "zustand/shallow";
import useDeviceSize from "@/hooks/useDeviceSize";
import { revalidatePortfolios } from "@/services/actions/revalidate.action";
import { PORTFOLIO_KEYS, updatePortfolio } from "@/services/portfolio.api";
import useModalStore from "@/stores/ModalStore";
import { type PublishStatus } from "@/types/blogType";
import type { PortfolioImage } from "@/types/portfolioType";
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
  techStacks: string[];
  category?: string;
  images: PortfolioImage[];
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
  const [coords, setCoords] = useState({ top: 0, width: 0 });
  const { handleEdit, handleDelete } = usePortfolioActions(portfolio.id, portfolio.slug);
  const deviceSize = useDeviceSize();
  const coverImage = portfolio.images[0];
  const queryClient = useQueryClient();

  const statusToggleMutation = useMutation({
    mutationFn: async () => {
      await updatePortfolio({
        id: portfolio.id,
        portfolioData: {
          title: portfolio.title,
          content: "",
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
      if (deviceSize === "mobile") setCoords({ top: rect.top, width: window.innerWidth });
      else setCoords({ top: rect.top, width: rect.width });
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <article
      ref={articleRef}
      className="flex flex-col gap-4 rounded-lg border-2 border-gray-300 bg-gray-100 p-5 text-text-primary"
    >
      {coverImage && (
        <div className="relative h-48 w-full overflow-hidden rounded-lg">
          <Image
            src={coverImage.url}
            alt={`${portfolio.title} 커버 이미지`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      )}

      <div className="flex flex-col gap-2 tablet:flex-row tablet:items-center">
        <div className="flex flex-1 items-center gap-2">
          <h2 className="text-3xl font-semibold">{portfolio.title}</h2>
          {portfolio.category && (
            <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-700">
              {portfolio.category}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isOwner && (
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-text-primary">{isPublished ? "공개" : "비공개"}</span>
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
          <button
            onClick={handleExpand}
            className="rounded p-1 font-semibold text-brand-tertiary focus-visible:ring-2 focus-visible:ring-brand-tertiary"
          >
            자세히 보기
          </button>
          {isOwner && (
            <>
              <button
                onClick={handleEdit}
                className="rounded p-1 font-semibold text-brand-tertiary focus-visible:ring-2 focus-visible:ring-brand-tertiary"
              >
                수정
              </button>
              <button
                onClick={handleDelete}
                className="rounded p-1 font-semibold text-brand-tertiary focus-visible:ring-2 focus-visible:ring-brand-tertiary"
              >
                삭제
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <p className="font-medium text-gray-800">{portfolio.date}</p>
      </div>

      <hr className="border-t-2 border-gray-400" />

      <div>
        <p className="mb-3 line-clamp-5 text-lg font-medium">{portfolio.excerpt}</p>
      </div>

      <TechStack stack={portfolio.techStacks} />

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
          />,
          document.body
        )}
    </article>
  );
}
