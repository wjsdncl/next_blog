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
  addTags: (tags: string[]) => void;
  style?: "default" | "outline";
}

const TagInput = ({ tags, addTag, removeTag, addTags, style = "default" }: TagInputProps) => {
  const [inputValue, setInputValue] = useState("");

  const tagStyle =
    style === "outline"
      ? "group rounded-md border-2 border-background-tertiary bg-background-secondary px-3 py-2 pr-10 text-text-primary focus-within:border-brand-secondary dark:focus-within:border-brand_dark-primary"
      : "";

  // 콤마로 구분된 태그 처리 함수
  const handleTagInput = (value: string) => {
    if (!value.trim()) return;

    // 문자열을 정규 표현식을 사용하여 콤마로 분리
    // 콤마 앞뒤 공백을 제거하면서 빈 문자열은 제외
    const tagArray = value
      .split(/\s*,\s*/)
      .filter((tag) => tag.trim() !== "")
      .map((tag) => tag.trim());

    if (tagArray.length > 1 && addTags) {
      // 여러 태그가 있고 addTags 함수가 제공된 경우, 한 번에 추가
      addTags(tagArray);
    } else {
      // 단일 태그이거나 addTags가 없는 경우, 개별적으로 추가
      tagArray.forEach((tag) => {
        if (tag) {
          addTag(tag);
        }
      });
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

  return (
    <div className={cn("group flex w-full flex-wrap items-center gap-2 py-1", tagStyle)}>
      {tags?.map((tag) => <Tag key={tag} text={tag} onRemove={removeTag} />)}
      <input
        className="grow truncate text-nowrap text-lg text-text-primary outline-none"
        placeholder="태그를 입력하세요"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
      />
    </div>
  );
};

export default TagInput;
