// TagInput.tsx

import { useState } from "react";

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
}

const TagInput = ({ tags, addTag, removeTag }: TagInputProps) => {
  const [inputValue, setInputValue] = useState("");

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
    <div className="flex w-full flex-wrap items-center gap-2 py-1">
      {tags.map((tag) => (
        <Tag key={tag} text={tag} onRemove={removeTag} />
      ))}
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
