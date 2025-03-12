import ReactMarkdown from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import removeMarkdown from "remove-markdown";
import components from "@/components/MarkdownComponents";
import { type ProjectCardProps } from "./ProjectCard";
import { ProjectLinks, TechStack } from "./ProjectMeta";

const ExpandedContent = ({
  coords,
  onClose,
  project,
}: {
  coords: { top: number; left: number; width: number };
  onClose: () => void;
  project: ProjectCardProps;
}) => (
  <div className="fixed inset-0 z-50 overflow-y-auto bg-black_opacity-60 backdrop-blur-sm scrollbar-hide">
    <div className="flex min-h-full items-start justify-center py-12" onClick={onClose}>
      <div
        className="relative mx-auto overflow-hidden rounded-2xl bg-gray-100"
        style={{
          marginTop: coords.top,
          width: coords.width,
          animation: "expandHorizontal 0.4s forwards, expandVertical 0.4s forwards",
        }}
      >
        <div className="p-6" onClick={(e) => e.stopPropagation()}>
          <div className="mb-4">
            <div className="flex items-center justify-between pb-2">
              <h2 className="text-3xl font-semibold">{project.title}</h2>
              <button onClick={onClose} className="px-3 py-1 font-semibold text-brand-tertiary">
                닫기
              </button>
            </div>
            <p className="pb-3 font-medium text-gray-800">
              {project.date}{" "}
              <span className="text-sm font-semibold text-brand-tertiary">
                ({project.isPersonal ? "개인 프로젝트" : "팀 프로젝트"})
              </span>
            </p>
            <hr className="border-t-2 border-gray-400" />
          </div>

          <div className="mb-6">
            <div className="mb-4">
              <h3 className="mb-2 text-2xl font-semibold"># AI 기반 핵심 요약</h3>
              <ul className="ml-5 list-disc">
                {project.summary.map((item, index) => (
                  <li key={index} className="ml-5">
                    {removeMarkdown(item)}
                  </li>
                ))}
              </ul>
            </div>

            <hr className="my-6 border-t-2 border-gray-400" />

            <div className="mb-4">
              <h3 className="mb-2 text-2xl font-semibold"># 프로젝트 설명</h3>
              <p className="text-lg font-medium">{project.description}</p>
            </div>

            <div className="">
              <h3 className="mb-2 text-2xl font-semibold"># 상세 내용</h3>
              <div className="prose text-lg prose-headings:text-text-primary prose-strong:text-text-primary prose-ul:text-text-primary prose-li:p-0">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                  rehypePlugins={[rehypeSlug]}
                  components={components}
                >
                  {project.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>

          <TechStack stack={project.techStack} />
          <ProjectLinks githubLink={project.githubLink} projectLink={project.projectLink} />
        </div>
      </div>
    </div>
  </div>
);

export default ExpandedContent;
