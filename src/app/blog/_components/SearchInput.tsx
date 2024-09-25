/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, useCallback } from "react";
import SearchIcon from "@/Icons/Search";
import { debounce } from "@/utils/DelayManager";

export default function SearchInput() {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleIconClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // 현재 URL의 searchParams를 수정하여 검색어를 반영하는 함수
  const updateSearchParams = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === searchParams.get("search")) return;

    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    router.push(`?${params.toString()}`);
  };

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      updateSearchParams(value);
    }, 500),
    [searchParams]
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      updateSearchParams(event.currentTarget.value);
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
        onChange={handleInputChange}
        onKeyDown={handleKeyDown} // Enter 키 이벤트 처리 추가
      />
    </div>
  );
}
