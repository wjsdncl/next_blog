"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import ReactMarkdown from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import removeMarkdown from "remove-markdown";
import components from "@/components/MarkdownComponents";
import GitHub from "@/Icons/Github";
import LinkIcon from "@/Icons/Link";

interface ProjectCardProps {
  title: string;
  isPersonal?: boolean;
  date: string;
  description: string;
  content: string;
  summary: string[];
  techStack: string[];
  githubLink?: string;
  projectLink?: string;
  isOwner?: boolean;
}

export default function ProjectCard({
  title,
  isPersonal,
  date,
  description,
  content,
  summary,
  techStack,
  githubLink,
  projectLink,
  isOwner,
}: ProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const articleRef = useRef<HTMLElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    document.body.style.overflow = isExpanded ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isExpanded]);

  const handleExpand = () => {
    if (!isExpanded && articleRef.current) {
      const rect = articleRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top - 40,
        left: rect.left + rect.width / 2,
        width: rect.width,
      });
    }
    setIsExpanded(!isExpanded);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsExpanded(false);
    }
  };

  const renderExpandedContent = () => (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black_opacity-60 backdrop-blur-sm scrollbar-hide"
      onClick={handleBackdropClick}
    >
      <div
        className="absolute my-10 w-[90%] max-w-[1000px] rounded-2xl bg-gray-100"
        style={{
          top: coords.top,
          left: `${coords.left}px`,
          transform: "translateX(-50%)",
          width: coords.width,
          animation: "expandHorizontal 0.8s ease forwards, expandVertical 0.4s ease forwards",
        }}
      >
        <div className="relative p-10">
          <div className="mb-4">
            <div className="flex items-center justify-between pb-2">
              <h2 className="text-3xl font-semibold">{title}</h2>
              <button onClick={handleExpand} className="px-3 py-1 font-semibold text-brand-tertiary">
                닫기
              </button>
            </div>
            <p className="pb-3 font-medium text-gray-800">
              {date}{" "}
              <span className="text-sm font-semibold text-brand-tertiary">
                ({isPersonal ? "개인 프로젝트" : "팀 프로젝트"})
              </span>
            </p>
            <hr className="border-t-2 border-gray-400" />
          </div>

          <div className="mb-6">
            <div className="mb-4">
              <h3 className="mb-2 text-xl font-semibold"># 프로젝트 설명</h3>
              <p className="text-lg font-medium">{description}</p>
            </div>

            <div className="mb-4">
              <h3 className="mb-2 text-xl font-semibold"># 상세 내용</h3>

              <div className="prose text-lg prose-headings:text-text-primary prose-strong:text-text-primary prose-ul:text-text-primary prose-li:p-0">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                  rehypePlugins={[rehypeSlug]}
                  components={components}
                >
                  {content}
                </ReactMarkdown>
              </div>
            </div>

            <hr className="my-4 border-t-2 border-gray-400" />

            <div>
              <h3 className="mb-2 text-xl font-semibold"># AI 기반 핵심 요약</h3>
              <ul className="ml-5 list-disc">
                {summary.map((item, index) => (
                  <li key={index} className="ml-5">
                    {removeMarkdown(item)}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <div className="mb-4 flex gap-2 text-wrap border-l-4 border-brand_dark-secondary px-3 py-2">
              {techStack.map((tech, index) => (
                <span key={index} className="text-sm font-semibold">
                  {tech}
                </span>
              ))}
            </div>
            <div className="flex flex-row-reverse gap-4">
              {projectLink && (
                <a
                  href={projectLink}
                  className="flex w-fit items-center justify-center gap-2 text-nowrap rounded-lg border border-gray-400 bg-brand_dark-tertiary px-3 py-2"
                >
                  <LinkIcon width={16} height={16} color="var(--text-primary)" />
                  프로젝트 링크
                </a>
              )}
              {githubLink && (
                <a
                  href={githubLink}
                  className="flex w-fit items-center justify-center gap-2 text-nowrap rounded-lg border border-gray-400 px-3 py-2"
                >
                  <GitHub width={16} height={16} color="var(--text-primary)" />
                  깃허브 링크
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <article
      ref={articleRef}
      className="flex flex-col gap-4 rounded-lg border-2 border-gray-300 bg-gray-100 p-5 text-text-primary"
    >
      <div>
        <div className="flex items-center pb-2">
          <h2 className="grow text-3xl font-semibold">{title}</h2>
          {isOwner && (
            <div className="flex items-center gap-1">
              <button className="p-1 font-semibold text-brand-tertiary">수정</button>
              <button className="p-1 font-semibold text-brand-tertiary">삭제</button>
            </div>
          )}
          <button onClick={handleExpand} className="px-3 py-1 font-semibold text-brand-tertiary">
            자세히 보기
          </button>
        </div>
        <p className="pb-3 font-medium text-gray-800">
          {date}{" "}
          <span className="text-sm font-semibold text-brand-tertiary">
            ({isPersonal ? "개인 프로젝트" : "팀 프로젝트"})
          </span>
        </p>
        <hr className="border-t-2 border-gray-400" />
      </div>

      <div>
        <p className="mb-3 line-clamp-5 text-lg font-medium">{description}</p>
        <ul className="list-disc">
          <span className="text-lg font-medium">AI 기반 핵심 요약</span>
          {summary.map((item, index) => (
            <li key={index} className="ml-5">
              {removeMarkdown(item)}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-2 text-wrap border-l-4 border-brand_dark-secondary px-3 py-2">
        {techStack.map((tech, index) => (
          <span key={index} className="text-sm font-semibold">
            {tech}
          </span>
        ))}
      </div>

      <div className="flex flex-row-reverse gap-4">
        {projectLink && (
          <a
            href={projectLink}
            className="flex w-fit items-center justify-center gap-2 text-nowrap rounded-lg border border-gray-400 bg-brand_dark-tertiary px-3 py-2"
          >
            <LinkIcon width={16} height={16} color="var(--text-primary)" />
            프로젝트 링크
          </a>
        )}
        {githubLink && (
          <a
            href={githubLink}
            className="flex w-fit items-center justify-center gap-2 text-nowrap rounded-lg border border-gray-400 px-3 py-2"
          >
            <GitHub width={16} height={16} color="var(--text-primary)" />
            깃허브 링크
          </a>
        )}
      </div>

      {isExpanded && createPortal(renderExpandedContent(), document.body)}
    </article>
  );
}
