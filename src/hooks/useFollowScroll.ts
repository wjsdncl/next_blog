/**
 * 스크롤 추적 사이드바 훅 (데스크탑 전용)
 *
 * startFollowPosition 이상 스크롤 시 요소가 부드럽게 따라옴.
 * damping(0~1): 낮을수록 느리게 추적 (0.1 = 목표 거리의 10%씩 이동).
 * requestAnimationFrame 기반 60fps 애니메이션.
 */
import { useRef, useEffect, useState, useCallback } from "react";
import useDeviceSize from "./useDeviceSize";

export default function useFollowScroll<T extends HTMLElement>(
  startFollowPosition = 200,
  damping = 0.1,
  topOffset = 0
) {
  const elementRef = useRef<T | null>(null);
  const targetPosition = useRef(0);
  const currentPosition = useRef(0);
  const [initialPosition, setInitialPosition] = useState<number | null>(null);
  const deviceSize = useDeviceSize();

  useEffect(() => {
    elementRef.current && (elementRef.current.style.willChange = "transform");
  }, []);

  useEffect(() => {
    if (deviceSize !== "desktop" || initialPosition !== null) return;

    if (elementRef.current) {
      const initialTop = elementRef.current.getBoundingClientRect().top + window.scrollY;
      if (!Number.isNaN(initialTop)) {
        setInitialPosition(initialTop);
        currentPosition.current = initialTop;
      }
    }
  }, [deviceSize, initialPosition]);

  const updatePosition = useCallback(() => {
    if (elementRef.current && initialPosition !== null) {
      const distance = targetPosition.current - currentPosition.current;
      currentPosition.current += distance * damping;
      elementRef.current.style.transform = `translateY(${currentPosition.current - initialPosition}px)`;

      if (Math.abs(distance) > 0.5) {
        requestAnimationFrame(updatePosition);
      }
    }
  }, [damping, initialPosition]);

  useEffect(() => {
    if (deviceSize !== "desktop") {
      elementRef.current && (elementRef.current.style.transform = "translateY(0)");
      return;
    }

    const handleScroll = () => {
      if (initialPosition !== null) {
        targetPosition.current =
          window.scrollY >= startFollowPosition
            ? window.scrollY - startFollowPosition + initialPosition + topOffset
            : initialPosition;

        requestAnimationFrame(updatePosition);
      }
    };

    const optimizedHandleScroll = () => requestAnimationFrame(handleScroll);

    window.addEventListener("scroll", optimizedHandleScroll);

    return () => {
      window.removeEventListener("scroll", optimizedHandleScroll);
    };
  }, [deviceSize, initialPosition, startFollowPosition, topOffset, updatePosition]);

  return elementRef;
}
