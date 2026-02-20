import ReactMarkdown from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import components from "@/components/MarkdownComponents";
import { type ProjectCardProps } from "./ProjectCard";
import { ProjectLinks, TechStack } from "./ProjectMeta";

export default function ExpandedContent({
  coords,
  onClose,
  project,
}: {
  coords: { top: number; width: number };
  onClose: () => void;
  project: ProjectCardProps;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black_opacity-80 backdrop-blur-sm scrollbar-hide">
      <div className="flex min-h-full items-start justify-center tablet:py-12" onClick={onClose}>
        <div
          className="relative overflow-hidden bg-gray-100 tablet:rounded-2xl"
          style={{
            marginTop: coords.top,
            width: coords.width,
            animation:
              window.innerWidth > 768
                ? "expandHorizontal 0.4s forwards, expandVertical 0.4s forwards"
                : "mobileExpandHorizontal  0.4s forwards, expandVertical 0.4s forwards",
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
              <p className="pb-3 font-medium text-gray-800">{project.date}</p>
              <hr className="border-t-2 border-gray-400" />
            </div>

            <div className="mb-6">
              {project.excerpt && (
                <div className="mb-4">
                  <h3 className="mb-2 text-2xl font-semibold"># 프로젝트 설명</h3>
                  <p className="text-lg font-medium">{project.excerpt}</p>
                </div>
              )}

              <hr className="my-6 border-t-2 border-gray-400" />

              <div className="">
                <h3 className="mb-2 text-2xl font-semibold"># 상세 내용</h3>
                <div className="prose rounded-xl border-4 border-gray-150 p-4 text-lg prose-headings:text-text-primary prose-strong:text-text-primary prose-ul:text-text-primary prose-li:p-0 tablet:px-6 tablet:py-4">
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

            <div className="flex flex-col gap-4">
              <TechStack stack={project.techStacks} />

              <div className="flex justify-end">
                <ProjectLinks links={project.links} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
