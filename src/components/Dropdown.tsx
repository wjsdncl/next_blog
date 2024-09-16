"use client";

import { useState } from "react";

interface Option {
  label: string;
  value: string;
}

interface DropdownProps {
  options: Option[];
  placeholder?: string;
  onSelect: (value: string) => void;
  showSelectedLabelAsPlaceholder?: boolean;
}

export default function Dropdown({
  options,
  placeholder = "Select an option",
  onSelect,
  showSelectedLabelAsPlaceholder = true,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);

  function handleSelect(option: Option) {
    setSelectedOption(option);
    onSelect(option.value);
    setIsOpen(false);
  }

  return (
    <div className="relative inline-block text-left">
      <div>
        {/* 드롭다운 버튼 */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex w-max justify-between rounded-md bg-_white bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-_gray-200 ring-opacity-5 hover:bg-gray-50 dark:bg-_black"
        >
          {selectedOption && showSelectedLabelAsPlaceholder ? selectedOption.label : placeholder}
          <svg
            className="-mr-1 ml-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.939l3.71-3.708a.75.75 0 111.06 1.06l-4 4a.75.75 0 01-1.06 0l-4-4a.75.75 0 01-.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* 드롭다운 목록 */}
      {isOpen && (
        <div className="absolute right-0 z-30 mt-2 w-full rounded-md bg-_white ring-1 ring-_gray-200 ring-opacity-5 dark:bg-_black">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option)}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
