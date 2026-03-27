"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortablePortfolioItemProps {
  id: string;
  title: string;
  date: string;
  category?: string;
  techStacks: string[];
}

export default function SortablePortfolioItem({ id, title, date, category, techStacks }: SortablePortfolioItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-lg bg-gray-100 px-4 py-3 ${isDragging ? "z-10 opacity-90 shadow-lg" : ""}`}
    >
      <button
        type="button"
        className="cursor-grab touch-none text-gray-500 hover:text-gray-300 active:cursor-grabbing"
        aria-label="드래그하여 순서 변경"
        {...attributes}
        {...listeners}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="5" cy="3" r="1.5" />
          <circle cx="11" cy="3" r="1.5" />
          <circle cx="5" cy="8" r="1.5" />
          <circle cx="11" cy="8" r="1.5" />
          <circle cx="5" cy="13" r="1.5" />
          <circle cx="11" cy="13" r="1.5" />
        </svg>
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-semibold">{title}</span>
          {category && (
            <span className="shrink-0 rounded-full bg-brand_dark-tertiary px-2 py-0.5 text-xs text-brand-quaternary">
              {category}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-700">
          <span>{date}</span>
          {techStacks.length > 0 && (
            <>
              <span>·</span>
              <span className="truncate">{techStacks.join(", ")}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
