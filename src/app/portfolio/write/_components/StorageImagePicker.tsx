"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
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

  const { data: images = [], isLoading } = useQuery({
    queryKey: ["storage-images"],
    queryFn: getStorageImages,
  });

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

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  return createPortal(
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
              {images.map((img: StorageImage) => {
                const isSelected = selectedUrls.has(img.url);
                return (
                  <button
                    key={img.name}
                    type="button"
                    onClick={() => toggleSelect(img.url)}
                    className={cn(
                      "group relative aspect-square overflow-hidden rounded-md border-2 transition-all",
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
                );
              })}
            </div>
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
    </div>,
    document.body
  );
}
