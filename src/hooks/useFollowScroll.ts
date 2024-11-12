import { useRef, useEffect, useState, useCallback } from "react";
import useDeviceSize from "./useDeviceSize";

export default function useFollowScroll<T extends HTMLElement>(startFollowPosition = 200, damping = 0.1) {
  const elementRef = useRef<T | null>(null);
  const targetPosition = useRef(0);
  const currentPosition = useRef(0);
  const [initialPosition, setInitialPosition] = useState<number | null>(null);
  const deviceSize = useDeviceSize();

  useEffect(() => {
    if (deviceSize !== "desktop") return;

    if (elementRef.current) {
      try {
        const initialTop = elementRef.current.getBoundingClientRect().top + window.scrollY;
        if (isNaN(initialTop)) return;

        setInitialPosition(initialTop);
        currentPosition.current = initialTop;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to calculate initial position:", error);
      }
    }
  }, [deviceSize]);

  const updatePosition = useCallback(() => {
    if (elementRef.current && initialPosition !== null) {
      const distance = targetPosition.current - currentPosition.current;

      currentPosition.current += distance * damping;
      const transform = `translateY(${currentPosition.current - initialPosition}px)`;
      elementRef.current.style.transform = transform;
      elementRef.current.style.willChange = "transform";

      if (Math.abs(distance) > 0.5) {
        requestAnimationFrame(updatePosition);
      }
    }
  }, [damping, initialPosition]);

  useEffect(() => {
    if (deviceSize !== "desktop") {
      if (elementRef.current) {
        elementRef.current.style.transform = "translateY(0)";
      }
      return;
    }

    const handleScroll = () => {
      if (initialPosition !== null) {
        if (window.scrollY >= startFollowPosition) {
          targetPosition.current = window.scrollY - startFollowPosition + initialPosition;
        } else {
          targetPosition.current = initialPosition;
        }
        requestAnimationFrame(updatePosition);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [deviceSize, initialPosition, startFollowPosition, updatePosition]);

  return elementRef;
}
