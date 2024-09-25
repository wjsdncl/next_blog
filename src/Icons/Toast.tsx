import { useState, useEffect } from "react";
import IconType from "@/types/IconType";

export function Check({
  width = 14,
  height = 14,
  primary = "#10B981",
  secondary = "#fff",
}: {
  width?: number | string;
  height?: number | string;
  primary?: string;
  secondary?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100); // 100ms 딜레이 추가로 자연스러운 애니메이션 효과
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`flex size-6 items-center justify-center rounded-full transition-transform duration-500 ease-out ${
        isVisible ? "scale-100 opacity-100" : "scale-0 opacity-0"
      }`}
      style={{ backgroundColor: primary }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke={secondary}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        width={width}
        height={height}
        className={`transition-all delay-150 duration-300 ${isVisible ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    </div>
  );
}

export function Info({ width = 24, height = 24, color = "#adadad" }: IconType) {
  return (
    <svg width={width} height={height} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10 5.52 0 10-4.48 10-10 0-5.52-4.48-10-10-10zM11 7h2v2h-2V7zm0 4h2v6h-2V11z"
        fill={color}
      />
    </svg>
  );
}

export function Loading({ width = 24, height = 24, color = "#10B981" }: IconType) {
  return (
    <svg width={width} height={height} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="#00000040" strokeWidth="4" />
      <path
        fill={color}
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
