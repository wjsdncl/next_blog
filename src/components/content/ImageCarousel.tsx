/* eslint-disable react-hooks/exhaustive-deps */
"use client";

/* eslint-disable tailwindcss/migration-from-tailwind-2 */

import Image from "next/image";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import CloseIcon from "@/Icons/Close.svg";

interface ImageCarouselProps {
  images: string[];
  slidesPerView?: number;
  className?: string;
}

export default function ImageCarousel({ images, slidesPerView = 1, className = "" }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [enlargedImageIndex, setEnlargedImageIndex] = useState<number>(-1);
  const [isMounted, setIsMounted] = useState(false);

  // 컴포넌트 마운트 확인
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // 이미지가 확대되었을 때 스크롤 방지 및 키보드 이벤트 등록
  useEffect(() => {
    if (enlargedImage) {
      // 이미지 확대 시 스크롤 방지
      document.body.style.overflow = "hidden";

      // 부모 요소들의 스크롤도 방지
      const overlayElement = document.querySelector(".overflow-y-auto") as HTMLElement;
      if (overlayElement) {
        overlayElement.style.overflow = "hidden";
      }

      // 키보드 이벤트 리스너 추가
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "ArrowLeft") {
          handlePrevEnlarged();
        } else if (e.key === "ArrowRight") {
          handleNextEnlarged();
        } else if (e.key === "Escape") {
          closeEnlargedView();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      // 원래 상태로 복원
      document.body.style.overflow = "";

      // 부모 요소들의 스크롤 복원
      const overlayElement = document.querySelector(".overflow-y-auto") as HTMLElement;
      if (overlayElement) {
        overlayElement.style.overflow = "auto";
      }
    }

    // 클린업 함수
    return () => {
      document.body.style.overflow = "";
      const overlayElement = document.querySelector(".overflow-y-auto") as HTMLElement;
      if (overlayElement) {
        overlayElement.style.overflow = "auto";
      }
    };
  }, [enlargedImage]);

  const handlePrev = () => {
    // slidesPerView 단위로 이전으로 이동
    if (currentIndex > 0) {
      setCurrentIndex(Math.max(0, currentIndex - slidesPerView));
    }
  };

  const handleNext = () => {
    // slidesPerView 단위로 다음으로 이동
    if (currentIndex + slidesPerView < images.length) {
      const nextIndex = currentIndex + slidesPerView;
      // 마지막 슬라이드를 넘어가지 않도록
      setCurrentIndex(Math.min(nextIndex, images.length - slidesPerView));
    }
  };

  const handlePrevEnlarged = () => {
    if (enlargedImageIndex > 0) {
      const newIndex = enlargedImageIndex - 1;
      setEnlargedImageIndex(newIndex);
      setEnlargedImage(images[newIndex]);
      setCurrentIndex(Math.floor(newIndex / slidesPerView) * slidesPerView);
    }
  };

  const handleNextEnlarged = () => {
    if (enlargedImageIndex < images.length - 1) {
      const newIndex = enlargedImageIndex + 1;
      setEnlargedImageIndex(newIndex);
      setEnlargedImage(images[newIndex]);
      setCurrentIndex(Math.floor(newIndex / slidesPerView) * slidesPerView);
    }
  };

  const handleImageClick = (image: string, index: number) => {
    setEnlargedImage(image);
    setEnlargedImageIndex(index);
  };

  const closeEnlargedView = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setEnlargedImage(null);
    setEnlargedImageIndex(-1);
  };

  // 슬라이드 상태 조건 계산 (인덱스 기반)
  const isStart = currentIndex === 0;
  const isEnd = currentIndex + slidesPerView >= images.length;

  // 인디케이터 계산을 위한 페이지 계산
  const totalSlides = Math.ceil(images.length / slidesPerView);
  const currentSlide = Math.floor(currentIndex / slidesPerView);

  // 확대된 이미지 모달 컴포넌트
  const EnlargedImageModal = () => (
    <div
      className="fixed inset-0 z-[999] flex size-full items-center justify-center bg-zinc-800/80 backdrop-blur-xl"
      onClick={closeEnlargedView}
    >
      <button className="absolute right-6 top-6 rounded-full bg-zinc-200/20 p-1" onClick={closeEnlargedView}>
        <CloseIcon width={24} height={24} color="var(--color-white)" />
      </button>
      <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
        <div className="relative size-full">
          <Image
            src={enlargedImage!}
            alt="확대된 이미지"
            width={0}
            height={0}
            sizes="100vw"
            style={{ width: "100%", height: "auto", maxHeight: "90vh", objectFit: "contain" }}
          />
        </div>

        {/* 이전 이미지 버튼 */}
        <button
          className={`fixed left-0 top-1/2 -translate-y-1/2 rounded-r-full bg-black bg-opacity-50 p-3 text-white transition ${
            enlargedImageIndex === 0 ? "cursor-not-allowed opacity-30" : "opacity-70 hover:opacity-100"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            handlePrevEnlarged();
          }}
          disabled={enlargedImageIndex === 0}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* 다음 이미지 버튼 */}
        <button
          className={`fixed right-0 top-1/2 -translate-y-1/2 rounded-l-full bg-black bg-opacity-50 p-3 text-white transition ${
            enlargedImageIndex === images.length - 1 ? "cursor-not-allowed opacity-30" : "opacity-70 hover:opacity-100"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            handleNextEnlarged();
          }}
          disabled={enlargedImageIndex === images.length - 1}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* 현재 이미지 번호 표시 */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 rounded-t-lg bg-black bg-opacity-70 px-4 py-2 text-sm font-medium text-white">
          {enlargedImageIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className={`relative w-full overflow-hidden ${className}`}>
        <h3 className="mb-2 text-2xl font-semibold"># 프로젝트 이미지</h3>
        <div className="relative">
          <div
            className="flex items-center transition-transform duration-300"
            style={{
              transform: `translateX(-${(currentIndex * 100) / images.length}%)`,
              width: `${(images.length * 100) / slidesPerView}%`,
            }}
          >
            {images.map((image, index) => (
              <div
                key={index}
                className="cursor-pointer px-1"
                style={{ width: `${100 / slidesPerView}%` }}
                onClick={() => handleImageClick(image, index)}
              >
                <div className="overflow-hidden rounded-lg">
                  <Image
                    src={image}
                    alt={`프로젝트 이미지 ${index + 1}`}
                    width={0}
                    height={0}
                    sizes="(max-width: 768px) 100vw, 600px"
                    style={{ width: "100%", height: "auto", maxHeight: "500px", objectFit: "cover" }}
                    className="transition-transform duration-300 hover:scale-105"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            className={`absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-black bg-opacity-50 p-2 text-white transition ${
              isStart ? "cursor-not-allowed opacity-30" : "opacity-70 hover:opacity-100"
            }`}
            onClick={handlePrev}
            disabled={isStart}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            className={`absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-black bg-opacity-50 p-2 text-white transition ${
              isEnd ? "cursor-not-allowed opacity-30" : "opacity-70 hover:opacity-100"
            }`}
            onClick={handleNext}
            disabled={isEnd}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="mt-2 flex justify-center gap-2">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              className={`size-2 rounded-full ${index === currentSlide ? "bg-brand-tertiary" : "bg-gray-300"}`}
              onClick={() => setCurrentIndex(index * slidesPerView)}
            />
          ))}
        </div>
      </div>

      {isMounted && enlargedImage && createPortal(<EnlargedImageModal />, document.body)}
    </>
  );
}
