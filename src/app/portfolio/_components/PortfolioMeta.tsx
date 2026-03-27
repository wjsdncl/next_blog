import Github from "@/Icons/Github.svg";
import LinkIcon from "@/Icons/Link.svg";
import { type PortfolioLink } from "@/types/portfolioType";

export const TechStack = ({ stack }: { stack: string[] }) => (
  <div className="flex flex-wrap gap-2">
    {stack.map((tech, index) => (
      <span key={index} className="rounded-full bg-brand_dark-quaternary px-3 py-1 text-xs font-medium text-gray-700">
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

export const PortfolioLinks = ({ links }: { links: PortfolioLink[] }) => (
  <div className="flex flex-row gap-4">
    {links.map((link) => (
      <a
        key={link.id}
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-fit items-center justify-center gap-2 text-nowrap rounded-lg border border-gray-400 px-3 py-2 text-sm font-medium focus-visible:ring-2 focus-visible:ring-brand-tertiary tablet:text-base"
      >
        {ICON_MAP[link.type] || <LinkIcon width={20} height={20} color="var(--text-primary)" />}
        {link.label || link.type}
      </a>
    ))}
  </div>
);
