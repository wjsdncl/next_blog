"use client";

import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getStorageImages, type StorageImage } from "@/services/post.api";
import { type FilePreview } from "@/components/ui/Form";
import CloseBold from "@/Icons/CloseBold.svg";
import cn from "@/utils/cn";

interface StorageImagePickerProps {
  onSelect: (images: FilePreview[]) => void;
  onClose: () => void;
}

export default function StorageImagePicker({ onSelect, onClose }: StorageImagePickerProps) {
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());
  const [enlargedIndex, setEnlargedIndex] = useState<number | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ["storage-images"],
    queryFn: ({ pageParam = 1 }) => getStorageImages({ page: pageParam }),
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextPage : undefined),
    initialPageParam: 1,
  });

  const images = data?.pages.flatMap((page) => page.images) ?? [];

  // 무한 스크롤 IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const toggleSelect = useCallback((url: string) => {
    setSelectedUrls((prev) => {
      const next = new Set(prev);
      if (next.has(url)) {
        next.delete(url);
      } else {
        next.add(url);
      }
      return next;
    });
  }, []);

  const handleConfirm = useCallback(() => {
    const selected: FilePreview[] = Array.from(selectedUrls).map((url) => ({
      file: new File([], ""),
      previewUrl: url,
      isUploaded: true,
    }));
    onSelect(selected);
    onClose();
  }, [selectedUrls, onSelect, onClose]);

  const goPrev = useCallback(() => {
    setEnlargedIndex((i) => (i !== null && i > 0 ? i - 1 : i));
  }, []);

  const goNext = useCallback(() => {
    setEnlargedIndex((i) => (i !== null && i < images.length - 1 ? i + 1 : i));
  }, [images.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (enlargedIndex !== null) {
          setEnlargedIndex(null);
        } else {
          onClose();
        }
      }
      if (enlargedIndex !== null) {
        if (e.key === "ArrowLeft") goPrev();
        if (e.key === "ArrowRight") goNext();
      }
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose, enlargedIndex, goPrev, goNext]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black_opacity-10 backdrop-blur-sm"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          className="relative flex max-h-[80vh] w-[90%] max-w-3xl flex-col rounded-lg border-4 border-gray-300 bg-background-primary shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-bold text-text-primary">스토리지 이미지 선택</h2>
            <button onClick={onClose} className="size-6" aria-label="닫기">
              <CloseBold width="100%" height="100%" />
            </button>
          </div>

          {/* 이미지 그리드 */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex h-40 items-center justify-center text-text-secondary">불러오는 중...</div>
            ) : images.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-text-secondary">이미지가 없습니다.</div>
            ) : (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img: StorageImage, index: number) => {
                  const isSelected = selectedUrls.has(img.url);
                  return (
                    <div key={img.name} className="relative aspect-square">
                      <button
                        type="button"
                        onClick={() => toggleSelect(img.url)}
                        className={cn(
                          "group relative size-full overflow-hidden rounded-md border-2 transition-all",
                          isSelected
                            ? "border-brand-primary ring-2 ring-brand-primary"
                            : "border-gray-200 hover:border-gray-400"
                        )}
                      >
                        <Image
                          src={img.url}
                          alt={img.name}
                          fill
                          sizes="(max-width: 768px) 25vw, 160px"
                          className="object-cover"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center bg-brand-primary/20">
                            <span className="rounded-full bg-brand-primary px-2 py-0.5 text-xs font-bold text-white">
                              선택됨
                            </span>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1.5 py-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <p className="truncate text-[10px] text-white">{img.name.split("/").pop()}</p>
                          <p className="text-[10px] text-gray-300">{formatSize(img.size)}</p>
                        </div>
                      </button>
                      {/* 확대 버튼 */}
                      <button
                        type="button"
                        onClick={() => setEnlargedIndex(index)}
                        className="absolute right-1 top-1 rounded bg-black/50 p-1 text-white opacity-0 transition-opacity hover:bg-black/70 [div:hover>&]:opacity-100"
                        aria-label="이미지 확대"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          <line x1="11" y1="8" x2="11" y2="14" />
                          <line x1="8" y1="11" x2="14" y2="11" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 무한 스크롤 트리거 */}
            <div ref={loadMoreRef} className="h-4" />
            {isFetchingNextPage && (
              <div className="flex justify-center py-4 text-sm text-text-secondary">더 불러오는 중...</div>
            )}
          </div>

          {/* 하단 바 */}
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
            <span className="text-sm text-text-secondary">{selectedUrls.size}개 선택됨</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-text-primary hover:bg-gray-300"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={selectedUrls.size === 0}
                className="rounded-md bg-brand_dark-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand_dark-secondary disabled:cursor-not-allowed disabled:opacity-50"
              >
                선택 완료
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 이미지 확대 오버레이 */}
      {enlargedIndex !== null && images[enlargedIndex] && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black_opacity-80 backdrop-blur-sm"
          onClick={() => setEnlargedIndex(null)}
        >
          {/* 닫기 */}
          <button
            className="absolute right-4 top-4 z-10 rounded-full p-2 text-white transition-colors hover:bg-gray-400"
            onClick={() => setEnlargedIndex(null)}
            aria-label="닫기"
          >
            <CloseBold width={24} height={24} />
          </button>

          {/* 카운터 */}
          <span className="absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
            {enlargedIndex + 1} / {images.length}
          </span>

          {/* 이전 버튼 */}
          {enlargedIndex > 0 && (
            <button
              className="absolute left-4 z-10 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70"
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              aria-label="이전 이미지"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          {/* 이미지 */}
          <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[enlargedIndex].url}
              alt={images[enlargedIndex].name}
              width={1200}
              height={800}
              className="max-h-[90vh] w-auto rounded-lg object-contain"
              unoptimized
            />
          </div>

          {/* 다음 버튼 */}
          {enlargedIndex < images.length - 1 && (
            <button
              className="absolute right-4 z-10 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70"
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              aria-label="다음 이미지"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
        </div>
      )}
    </>,
    document.body
  );
}
