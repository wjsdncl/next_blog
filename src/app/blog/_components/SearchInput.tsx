"use client";

import { useRef, useState } from "react";
import SearchIcon from "@/Icons/Search";

export default function SearchInput() {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleIconClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="relative">
      <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-text" onClick={handleIconClick}>
        <SearchIcon width={24} height={24} color={isFocused ? "var(--color-gray-600)" : "var(--color-gray-300)"} />
      </div>

      <input
        ref={inputRef}
        type="text"
        className="h-10 w-60 rounded-md border border-gray-300 bg-background-primary pl-9 pr-4 text-text-primary focus:border-gray-600 focus:caret-gray-600 focus:outline-none"
        placeholder="검색어를 입력하세요."
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </div>
  );
}
