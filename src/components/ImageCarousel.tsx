"use client";

/* eslint-disable tailwindcss/migration-from-tailwind-2 */

import Image from "next/image";
import { useState, useEffect } from "react";
import CloseIcon from "@/Icons/Close.svg";

interface ImageCarouselProps {
  images: string[];
  slidesPerView?: number;
  className?: string;
}

export default function ImageCarousel({ images, slidesPerView = 1, className = "" }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  // 이미지가 확대되었을 때 스크롤 방지를 위한 useEffect
  useEffect(() => {
    if (enlargedImage) {
      // 이미지 확대 시 스크롤 방지
      document.body.style.overflow = "hidden";

      // 부모 요소들의 스크롤도 방지
      const overlayElement = document.querySelector(".overflow-y-auto") as HTMLElement;
      if (overlayElement) {
        overlayElement.style.overflow = "hidden";
      }
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
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < images.length - slidesPerView) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleImageClick = (image: string) => {
    setEnlargedImage(image);
  };

  const closeEnlargedView = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setEnlargedImage(null);
  };

  const isStart = currentIndex === 0;
  const isEnd = currentIndex >= images.length - slidesPerView;

  return (
    <>
      <div className={`relative w-full overflow-hidden ${className}`}>
        <h3 className="mb-2 text-2xl font-semibold"># 프로젝트 이미지</h3>
        <div className="relative">
          <div
            className="flex transition-transform duration-300"
            style={{
              transform: `translateX(-${currentIndex * (100 / slidesPerView)}%)`,
              width: `${(images.length / slidesPerView) * 100}%`,
            }}
          >
            {images.map((image, index) => (
              <div
                key={index}
                className="cursor-pointer px-1"
                style={{ width: `${(100 / images.length) * slidesPerView}%` }}
                onClick={() => handleImageClick(image)}
              >
                <div className="overflow-hidden rounded-lg">
                  <Image
                    src={image}
                    alt={`프로젝트 이미지 ${index + 1}`}
                    width={600}
                    height={400}
                    className="h-auto w-full object-cover transition-transform duration-300 hover:scale-105"
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
          {Array.from({ length: Math.ceil(images.length / slidesPerView) }).map((_, index) => (
            <button
              key={index}
              className={`size-2 rounded-full ${
                index === Math.floor(currentIndex / slidesPerView) ? "bg-brand-tertiary" : "bg-gray-300"
              }`}
              onClick={() => setCurrentIndex(index * slidesPerView)}
            />
          ))}
        </div>
      </div>

      {enlargedImage && (
        <div
          className="fixed inset-0 z-[70] flex size-full items-center justify-center bg-zinc-800/80 backdrop-blur-xl"
          onClick={closeEnlargedView}
        >
          <button className="absolute right-6 top-6 rounded-full bg-zinc-200/20 p-1" onClick={closeEnlargedView}>
            <CloseIcon width={24} height={24} color={"#fff"} />
          </button>
          <div className="max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={enlargedImage}
              alt="확대된 이미지"
              width={1200}
              height={800}
              className="max-h-[90vh] max-w-[90vw] object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
