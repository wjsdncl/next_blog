import { Github } from "@/Icons/Github";
import LinkIcon from "@/Icons/Link";

export const TechStack = ({ stack }: { stack: string[] }) => (
  <div className="flex flex-wrap gap-2 text-wrap border-l-4 border-brand_dark-secondary px-3 py-2">
    {stack.map((tech, index) => (
      <span key={index} className="text-sm font-semibold">
        {tech}
      </span>
    ))}
  </div>
);

export const ProjectLinks = ({ githubLink, projectLink }: { githubLink?: string; projectLink?: string }) => (
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
        <Github width={16} height={16} color="var(--text-primary)" />
        깃허브 링크
      </a>
    )}
  </div>
);
