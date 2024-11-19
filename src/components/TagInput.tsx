"use client";

import { useState } from "react";
import cn from "@/utils/cn";

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
  style?: "default" | "outline";
}

const TagInput = ({ tags, addTag, removeTag, style = "default" }: TagInputProps) => {
  const [inputValue, setInputValue] = useState("");

  const tagStyle =
    style === "outline"
      ? "group rounded-md border-2 border-background-tertiary bg-background-secondary px-3 py-2 pr-10 text-text-primary focus-within:border-brand-secondary dark:focus-within:border-brand_dark-primary"
      : "";

  const handleKeyDown = (e: { key: string; preventDefault: () => void }) => {
    if ((e.key === "Enter" || e.key === ",") && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue.trim());
      setInputValue("");
    } else if (e.key === "Backspace" && inputValue === "") {
      e.preventDefault();
      if (tags.length > 0) {
        removeTag(tags[tags.length - 1]);
      }
    } else if (e.key === "," || e.key === "Enter") {
      e.preventDefault();
    }
  };

  return (
    <div className={cn("group flex w-full flex-wrap items-center gap-2 py-1", tagStyle)}>
      {tags?.map((tag) => <Tag key={tag} text={tag} onRemove={removeTag} />)}
      <input
        className="grow truncate text-nowrap text-lg text-text-primary outline-none"
        placeholder="태그를 입력하세요"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

export default TagInput;
