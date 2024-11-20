"use client";

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

export default function ProjectCard(props: ProjectCardProps) {
  return (
    <article className="flex flex-col gap-4 rounded-lg border-2 border-gray-300 bg-gray-100 p-5 text-text-primary">
      <div>
        <div className="flex items-center pb-2">
          <h2 className="grow text-3xl font-semibold">{props.title}</h2>
          {props.isOwner && (
            <div className="flex items-center gap-1">
              <button className="p-1 font-semibold text-brand-tertiary">수정</button>
              <button className="p-1 font-semibold text-brand-tertiary">삭제</button>
            </div>
          )}
          <button onClick={() => {}} className="px-3 py-1 font-semibold text-brand-tertiary">
            자세히 보기
          </button>
        </div>
        <p className="pb-3 font-medium text-gray-800">
          {props.date}{" "}
          <span className="text-sm font-semibold text-brand-tertiary">
            ( {props.isPersonal ? "개인 프로젝트" : "팀 프로젝트"} )
          </span>
        </p>
        <hr className="border-t-2 border-gray-400" />
      </div>

      <div>
        <p className="mb-3 line-clamp-5 text-lg font-medium">{props.description}</p>
        <ul className="list-disc">
          <span className="text-lg font-medium">AI 기반 핵심 요약</span>
          {props.summary.map((summary, index) => (
            <li key={index} className="ml-5">
              {summary}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-2 text-wrap border-l-4 border-brand_dark-secondary px-3 py-2">
        {props.techStack.map((tech, index) => (
          <span key={index} className="text-sm font-semibold">
            {tech}
          </span>
        ))}
      </div>

      <div className="flex flex-row-reverse gap-4">
        {props.projectLink && (
          <a
            href={props.projectLink}
            className="flex w-fit items-center justify-center gap-2 text-nowrap rounded-lg border border-gray-400 bg-brand_dark-tertiary px-3 py-2"
          >
            <LinkIcon width={16} height={16} color="var(--text-primary)" />
            프로젝트 링크
          </a>
        )}
        {props.githubLink && (
          <a
            href={props.githubLink}
            className="flex w-fit items-center justify-center gap-2 text-nowrap rounded-lg border border-gray-400 px-3 py-2"
          >
            <GitHub width={16} height={16} color="var(--text-primary)" />
            깃허브 링크
          </a>
        )}
      </div>
    </article>
  );
}
