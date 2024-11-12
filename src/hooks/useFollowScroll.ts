import { useRef, useEffect, useState, useCallback } from "react";
import useDeviceSize from "./useDeviceSize";

export default function useFollowScroll<T extends HTMLElement>(startFollowPosition = 200, damping = 0.1) {
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
            ? window.scrollY - startFollowPosition + initialPosition
            : initialPosition;

        requestAnimationFrame(updatePosition);
      }
    };

    const optimizedHandleScroll = () => requestAnimationFrame(handleScroll);

    window.addEventListener("scroll", optimizedHandleScroll);

    return () => {
      window.removeEventListener("scroll", optimizedHandleScroll);
    };
  }, [deviceSize, initialPosition, startFollowPosition, updatePosition]);

  return elementRef;
}
