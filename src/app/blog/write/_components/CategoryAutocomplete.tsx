"use client";

import { useState, useRef, useEffect } from "react";

interface CategoryOption {
  name: string;
  postCount: number;
}

interface CategoryAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  categories: CategoryOption[];
}

export default function CategoryAutocomplete({ value, onChange, categories }: CategoryAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = categories.filter((c) => !value || c.name.toLowerCase().includes(value.toLowerCase()));

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <input
        className="h-min w-full resize-none overflow-hidden text-xl font-bold outline-none"
        placeholder="카테고리를 입력하세요"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
      />
      {isOpen && filtered.length > 0 && (
        <ul className="absolute left-0 top-full z-10 mt-1 max-h-48 w-64 overflow-y-auto rounded-md border border-gray-300 bg-background-primary shadow-lg">
          {filtered.map((cat) => (
            <li key={cat.name}>
              <button
                type="button"
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-200"
                onClick={() => {
                  onChange(cat.name);
                  setIsOpen(false);
                }}
              >
                <span className="font-medium">{cat.name}</span>
                <span className="text-xs text-gray-500">{cat.postCount}개</span>
              </button>
            </li>
          ))}
          {value && !categories.some((c) => c.name === value) && (
            <li className="border-t border-gray-200 px-3 py-2 text-sm text-gray-500">&quot;{value}&quot; 새로 생성</li>
          )}
        </ul>
      )}
    </div>
  );
}
