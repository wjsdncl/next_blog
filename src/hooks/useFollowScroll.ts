import { useRef, useEffect, useState } from "react";
import useDeviceSize from "./useDeviceSize";

export default function useFollowScroll<T extends HTMLElement>(startFollowPosition: number = 200) {
  const elementRef = useRef<T | null>(null);
  const targetPosition = useRef(0);
  const currentPosition = useRef(0);
  const [initialPosition, setInitialPosition] = useState<number | null>(null);
  const deviceSize = useDeviceSize();

  useEffect(() => {
    if (deviceSize !== "desktop") return;

    if (elementRef.current) {
      const initialTop = elementRef.current.getBoundingClientRect().top + window.scrollY;
      setInitialPosition(initialTop);
      currentPosition.current = initialTop;
    }
  }, [deviceSize]);

  useEffect(() => {
    if (deviceSize !== "desktop") {
      if (elementRef.current) {
        elementRef.current.style.transform = "translateY(0)";
      }
      return;
    }

    const updatePosition = () => {
      if (elementRef.current && initialPosition !== null) {
        const distance = targetPosition.current - currentPosition.current;
        const damping = 0.05;

        currentPosition.current += distance * damping;
        elementRef.current.style.transform = `translateY(${currentPosition.current - initialPosition}px)`;

        if (Math.abs(distance) > 0.5) {
          requestAnimationFrame(updatePosition);
        }
      }
    };

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
  }, [deviceSize, initialPosition, startFollowPosition]);

  return elementRef;
}
