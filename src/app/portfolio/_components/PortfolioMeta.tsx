import Github from "@/Icons/Github.svg";
import LinkIcon from "@/Icons/Link.svg";
import { type PortfolioLink } from "@/types/portfolioType";

export const TechStack = ({ stack }: { stack: string[] }) => (
  <div className="flex flex-wrap gap-2">
    {stack.map((tech, index) => (
      <span
        key={index}
        className="rounded-full bg-brand_dark-quaternary px-2.5 py-0.5 text-[11px] font-medium text-gray-700"
      >
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
  playstore: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--text-primary)">
      <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-1.4l2.834 1.64a1 1 0 0 1 0 1.74l-2.834 1.64-2.532-2.533 2.532-2.487zM5.864 2.658L16.8 8.99l-2.302 2.302-8.635-8.635z" />
    </svg>
  ),
  appstore: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--text-primary)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
      <path d="M8 16l4-8 4 8" />
      <path d="M9.5 14h5" />
    </svg>
  ),
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
