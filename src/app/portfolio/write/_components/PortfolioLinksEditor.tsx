"use client";

import { useState } from "react";

interface LinkEntry {
  type: string;
  url: string;
}

const LINK_TYPE_OPTIONS = [
  { value: "github", label: "Github" },
  { value: "live", label: "Live" },
  { value: "demo", label: "Demo" },
  { value: "docs", label: "Docs" },
  { value: "figma", label: "Figma" },
  { value: "other", label: "기타" },
];

const DEFAULT_LINKS: LinkEntry[] = [
  { type: "github", url: "" },
  { type: "live", url: "" },
];

interface PortfolioLinksEditorProps {
  initialLinks?: LinkEntry[];
  onChange: (links: LinkEntry[]) => void;
}

export default function PortfolioLinksEditor({ initialLinks, onChange }: PortfolioLinksEditorProps) {
  const [links, setLinks] = useState<LinkEntry[]>(initialLinks ?? DEFAULT_LINKS);

  const updateLinks = (updated: LinkEntry[]) => {
    setLinks(updated);
    onChange(updated);
  };

  const handleTypeChange = (index: number, type: string) => {
    const updated = links.map((link, i) => (i === index ? { ...link, type } : link));
    updateLinks(updated);
  };

  const handleUrlChange = (index: number, url: string) => {
    const updated = links.map((link, i) => (i === index ? { ...link, url } : link));
    updateLinks(updated);
  };

  const handleRemove = (index: number) => {
    const updated = links.filter((_, i) => i !== index);
    updateLinks(updated);
  };

  const handleAdd = () => {
    updateLinks([...links, { type: "other", url: "" }]);
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {links.map((link, index) => (
        <div key={index} className="flex items-center gap-2">
          <select
            value={link.type}
            onChange={(e) => handleTypeChange(index, e.target.value)}
            className="h-10 w-24 shrink-0 rounded-md border-2 border-background-tertiary bg-background-secondary px-2 text-sm font-medium text-text-primary outline-none focus:border-brand_dark-primary"
          >
            {LINK_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <input
            type="url"
            value={link.url}
            onChange={(e) => handleUrlChange(index, e.target.value)}
            placeholder="https://..."
            className="h-10 min-w-0 grow rounded-md border-2 border-background-tertiary bg-background-secondary px-3 text-sm text-text-primary outline-none placeholder:text-gray-450 focus:border-brand_dark-primary"
          />

          <button
            type="button"
            onClick={() => handleRemove(index)}
            className="flex size-10 shrink-0 items-center justify-center rounded-md border-2 border-background-tertiary text-gray-600 hover:bg-gray-200 hover:text-error"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={handleAdd}
        className="col-span-2 flex h-10 items-center justify-center gap-1 rounded-md border-2 border-dashed border-background-tertiary text-sm font-medium text-gray-600 hover:border-brand-tertiary hover:text-brand-tertiary"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        링크 추가
      </button>
    </div>
  );
}
