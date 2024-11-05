"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, useCallback } from "react";
import Category from "@/Icons/Category";
import SearchIcon from "@/Icons/Search";
import { debounce } from "@/utils/DelayManager";

export default function SearchInput() {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") ?? undefined; // 검색어 추출
  const categoryQuery = searchParams.get("category") ?? undefined; // 카테고리 추출
  const tagQuery = searchParams.get("tag") ?? undefined; // 태그 추출

  const handleIconClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const updateSearchParams = (value: string) => {
    const params = new URLSearchParams();

    if (value) {
      params.set("search", value);
    }

    router.push(`?${params.toString()}`);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="flex w-full items-center justify-between">
      <div className="w-full">
        {categoryQuery && (
          <p className="flex cursor-default items-center gap-1 text-4xl font-semibold text-gray-800">
            <Category width={32} height={32} color="var(--color-gray-800)" />
            {categoryQuery}
          </p>
        )}

        {tagQuery && (
          <p className="flex cursor-default items-center text-4xl font-semibold text-gray-800"># {tagQuery}</p>
        )}
      </div>

      <div className="relative size-fit">
        <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-text" onClick={handleIconClick}>
          <SearchIcon width={24} height={24} color={isFocused ? "var(--color-gray-600)" : "var(--color-gray-300)"} />
        </div>

        <input
          ref={inputRef}
          defaultValue={searchQuery}
          type="text"
          className="h-10 w-60 rounded-md border border-gray-300 bg-background-primary pl-9 pr-4 text-text-primary focus:border-gray-600 focus:caret-gray-600 focus:outline-none"
          placeholder="검색어를 입력하세요."
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
}
