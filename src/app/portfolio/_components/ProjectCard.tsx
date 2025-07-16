"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import removeMarkdown from "remove-markdown";
import { useShallow } from "zustand/shallow";
import useDeviceSize from "@/hooks/useDeviceSize";
import useModalStore from "@/stores/ModalStore";
import DeleteConfirmationModal from "./ProjectDeleteModal";
import ExpandedContent from "./ProjectDetailOverlay";
import { ProjectLinks, TechStack } from "./ProjectMeta";

export interface ProjectCardProps {
  id: number;
  title: string;
  isPersonal?: boolean;
  date: string;
  description: string;
  content: string;
  summary: string[];
  techStack: string[];
  links: Array<{
    id: number;
    title: string; // "GitHub", "Demo", "Design" 등
    url: string;
    icon: string | null;
  }>;
  isOwner?: boolean;
  images?: string[];
}

const useProjectActions = (projectId: number) => {
  const router = useRouter();
  const { openModal, closeModal } = useModalStore(
    useShallow((state) => ({ openModal: state.openModal, closeModal: state.closeModal }))
  );

  const handleEdit = () => router.push(`/portfolio/write?id=${projectId}`);

  const handleDelete = () => {
    const modalId = openModal(
      <DeleteConfirmationModal projectId={projectId} onClose={() => modalId && closeModal(modalId)} />
    );
  };

  return { handleEdit, handleDelete };
};

export default function ProjectCard(project: ProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const articleRef = useRef<HTMLElement>(null);
  const [coords, setCoords] = useState({ top: 0, width: 0 });
  const { handleEdit, handleDelete } = useProjectActions(project.id);
  const deviceSize = useDeviceSize();

  useEffect(() => {
    document.body.style.overflow = isExpanded ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isExpanded]);

  const handleExpand = () => {
    if (!isExpanded && articleRef.current) {
      const rect = articleRef.current.getBoundingClientRect();
      if (deviceSize === "mobile") setCoords({ top: rect.top, width: window.innerWidth });
      else setCoords({ top: rect.top, width: rect.width });
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <article
      ref={articleRef}
      className="flex flex-col gap-4 rounded-lg border-2 border-gray-300 bg-gray-100 p-5 text-text-primary"
    >
      <div className="flex flex-col gap-2 tablet:flex-row tablet:items-center">
        <div className="flex flex-1 items-end gap-2">
          <h2 className="text-3xl font-semibold">{project.title}</h2>

          <span className="pb-1 text-sm font-semibold text-brand-tertiary tablet:hidden">
            {`(${project.isPersonal ? "개인 프로젝트" : "팀 프로젝트"})`}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={handleExpand} className="p-1 font-semibold text-brand-tertiary">
            자세히 보기
          </button>
          {project.isOwner && (
            <>
              <button onClick={handleEdit} className="p-1 font-semibold text-brand-tertiary">
                수정
              </button>
              <button onClick={handleDelete} className="p-1 font-semibold text-brand-tertiary">
                삭제
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <p className="font-medium text-gray-800">{project.date}</p>
        <span className="hidden text-sm font-semibold text-brand-tertiary tablet:inline">
          {`(${project.isPersonal ? "개인 프로젝트" : "팀 프로젝트"})`}
        </span>
      </div>

      <hr className="border-t-2 border-gray-400" />

      <div>
        <p className="mb-3 line-clamp-5 text-lg font-medium">{project.description}</p>
        <ul className="hidden list-disc tablet:block">
          <span className="text-lg font-medium">AI 기반 핵심 요약</span>
          {project.summary.map((item, index) => (
            <li key={index} className="ml-5">
              {removeMarkdown(item)}
            </li>
          ))}
        </ul>
      </div>

      <TechStack stack={project.techStack} />
      <ProjectLinks links={project.links} />

      {isExpanded &&
        createPortal(<ExpandedContent coords={coords} onClose={handleExpand} project={project} />, document.body)}
    </article>
  );
}
