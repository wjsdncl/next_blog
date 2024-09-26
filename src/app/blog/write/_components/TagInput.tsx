"use client";

import { useState } from "react";

// Tag 컴포넌트
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

const TagInput = () => {
  const [tags, setTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");

  const addTag = (value: string) => {
    if (value && !tags.includes(value)) {
      setTags([...tags, value]);
    }
    setInputValue("");
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: { key: string; preventDefault: () => void }) => {
    if ((e.key === "Enter" || e.key === ",") && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue.trim());
    } else if (e.key === "Backspace" && inputValue === "") {
      // 입력값이 비어있고 Backspace 키가 눌렸을 때
      e.preventDefault();
      if (tags.length > 0) {
        removeTag(tags[tags.length - 1]); // 마지막 태그 제거
      }
    } else if (e.key === ",") e.preventDefault();
  };

  return (
    <div className="flex w-full flex-wrap items-center gap-2 py-1">
      {/* 태그 표시 */}
      {tags.map((tag) => (
        <Tag key={tag} text={tag} onRemove={removeTag} />
      ))}
      {/* 태그 입력 부분 */}
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
