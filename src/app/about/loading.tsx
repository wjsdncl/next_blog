"use client";

import { HashLoader } from "react-spinners";

export default function Loading() {
  return (
    <div className="bg-white/80 fixed inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-sm">
      <HashLoader color="#8f83ed" size={50} speedMultiplier={1.2} />
      <p className="mt-4 text-xl font-medium">
        <span className="inline-block text-2xl font-semibold">
          {["L", "o", "a", "d", "i", "n", "g"].map((char, i) => (
            <span key={i} className="animate-wave gradient-text inline-block" style={{ animationDelay: `${i * 0.1}s` }}>
              {char}
            </span>
          ))}
        </span>
      </p>
    </div>
  );
}
