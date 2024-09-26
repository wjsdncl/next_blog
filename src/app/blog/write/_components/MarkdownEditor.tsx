"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"; // 다크 테마 스타일 사용
import remarkGfm from "remark-gfm";
import TagInput from "./TagInput";

export default function MarkdownEditor() {
  const [markdown, setMarkdown] = useState<string>("");
  const [title, setTitle] = useState<string>("");

  const components = {
    code({
      inline,
      className,
      children,
      ...props
    }: {
      inline?: boolean;
      className?: string;
      children?: React.ReactNode;
    }) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div" {...props}>
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
  };

  return (
    <div className="flex h-dvh w-full">
      {/* 작성 부분 */}
      <div className="flex max-w-[50%] basis-1/2 flex-col gap-4 bg-background-primary p-[64px_40px_40px]">
        {/* 제목 입력 부분 */}
        <div>
          <textarea
            className="h-min w-full resize-none overflow-hidden text-5xl font-bold outline-none"
            placeholder="제목을 입력하세요"
            rows={1}
            onChange={(e) => {
              setTitle(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
              }
            }}
          />
          <hr className="mt-3 w-full rounded-full border-[3px] border-brand-secondary dark:border-brand_dark-secondary" />
        </div>

        <TagInput />

        <textarea
          className="size-full resize-none text-lg outline-none"
          rows={10}
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          placeholder="글을 작성하세요"
        />
      </div>

      {/* 프리뷰 부분 */}
      <div className="flex max-w-[50%] basis-1/2 flex-col gap-4 overflow-y-auto bg-gray-100 p-[64px_40px_40px]">
        <h1 className="min-h-[58px] text-5xl font-bold">{title}</h1>

        <div className="prose w-full max-w-none text-lg dark:prose-invert">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
            {markdown}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
