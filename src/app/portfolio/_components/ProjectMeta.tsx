import Github from "@/Icons/Github.svg";
import LinkIcon from "@/Icons/Link.svg";
import { type PortfolioLink } from "@/types/portfolioType";

export const TechStack = ({ stack }: { stack: string[] }) => (
  <div className="flex flex-wrap gap-2 text-wrap border-l-4 border-brand_dark-secondary px-3 py-2">
    {stack.map((tech, index) => (
      <span key={index} className="text-sm font-semibold">
        {tech}
      </span>
    ))}
  </div>
);

const ICON_MAP: Record<string, JSX.Element> = {
  github: <Github width={20} height={20} color="var(--text-primary)" />,
  link: <LinkIcon width={20} height={20} color="var(--text-primary)" />,
  live: <LinkIcon width={20} height={20} color="var(--text-primary)" />,
  demo: <LinkIcon width={20} height={20} color="var(--text-primary)" />,
};

export const ProjectLinks = ({ links }: { links: PortfolioLink[] }) => (
  <div className="flex flex-row gap-4">
    {links.map((link) => (
      <a
        key={link.id}
        href={link.url}
        className="flex w-fit items-center justify-center gap-2 text-nowrap rounded-lg border border-gray-400 px-3 py-2 text-sm font-medium tablet:text-base"
      >
        {ICON_MAP[link.type] || <LinkIcon width={20} height={20} color="var(--text-primary)" />}
        {link.label || link.type}
      </a>
    ))}
  </div>
);
