import Github from "@/Icons/Github.svg";
import LinkIcon from "@/Icons/Link.svg";

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
  <div className="flex flex-row gap-4">
    {githubLink && (
      <a
        href={githubLink}
        className="flex w-fit items-center justify-center gap-2 text-nowrap rounded-lg border border-gray-400 px-3 py-2 text-sm font-medium tablet:text-base"
      >
        <Github width={20} height={20} color="var(--text-primary)" />
        {"깃허브 링크"}
      </a>
    )}
    {projectLink && (
      <a
        href={projectLink}
        className="flex w-fit items-center justify-center gap-2 text-nowrap rounded-lg border border-gray-400 bg-brand_dark-tertiary px-3 py-2 text-sm font-medium tablet:text-base"
      >
        <LinkIcon width={20} height={20} color="var(--text-primary)" />
        {"프로젝트 링크"}
      </a>
    )}
  </div>
);
