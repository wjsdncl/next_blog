"use client";

import { useState } from "react";
import cn from "@/utils/cn";
import toast from "@/utils/toast";

interface TagProps {
  text: string;
  onRemove: (text: string) => void;
}

const Tag = ({ text, onRemove }: TagProps) => (
  <button className="text-sm" onClick={() => onRemove(text)}>
    <span className="inline-flex items-center rounded bg-brand-primary px-3 py-1 text-left text-lg font-medium text-white">
      {text}
    </span>
  </button>
);

interface TagInputProps {
  tags: string[];
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  addTags: (tags: string[]) => void;
  style?: "default" | "outline";
  suggestions?: string[];
}

const TagInput = ({ tags, addTag, removeTag, addTags, style = "default", suggestions }: TagInputProps) => {
  const [inputValue, setInputValue] = useState("");

  const tagStyle =
    style === "outline"
      ? "group rounded-md border-2 border-background-tertiary bg-background-secondary px-3 py-2 pr-10 text-text-primary focus-within:border-brand_dark-primary"
      : "";

  const handleTagInput = (value: string) => {
    if (!value.trim()) return;

    const allTags = value
      .split(/\s*,\s*/)
      .filter((tag) => tag.trim() !== "")
      .map((tag) => tag.trim());

    const duplicates = allTags.filter((tag) => tags.includes(tag));
    const newTags = allTags.filter((tag) => !tags.includes(tag));

    if (duplicates.length > 0) {
      toast.error(`이미 추가된 항목: ${duplicates.join(", ")}`);
    }

    if (newTags.length > 0) {
      if (newTags.length > 1 && addTags) {
        addTags(newTags);
      } else {
        newTags.forEach((tag) => addTag(tag));
      }
    }

    setInputValue("");
  };

  const handleKeyDown = (e: { key: string; preventDefault: () => void }) => {
    if ((e.key === "Enter" || e.key === ",") && inputValue.trim()) {
      e.preventDefault();
      handleTagInput(inputValue);
    } else if (e.key === "Backspace" && inputValue === "") {
      e.preventDefault();
      if (tags.length > 0) {
        removeTag(tags[tags.length - 1]);
      }
    } else if (e.key === "," || e.key === "Enter") {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    handleTagInput(pastedText);
  };

  const availableSuggestions = suggestions?.filter(
    (s) => !tags.includes(s) && (!inputValue || s.toLowerCase().includes(inputValue.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-2">
      <div className={cn("group flex w-full flex-wrap items-center gap-2 py-1", tagStyle)}>
        {tags?.map((tag) => (
          <Tag key={tag} text={tag} onRemove={removeTag} />
        ))}
        <input
          className="grow truncate text-nowrap text-lg text-text-primary outline-none"
          placeholder="태그를 입력하세요"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
        />
      </div>
      {availableSuggestions && availableSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {availableSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => !tags.includes(suggestion) && addTag(suggestion)}
              className="rounded-md border border-gray-300 bg-gray-100 px-2.5 py-1 text-sm text-gray-600 transition-colors hover:border-brand-tertiary hover:text-brand-tertiary"
            >
              + {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagInput;
