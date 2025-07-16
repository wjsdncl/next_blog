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

const ICON_MAP: Record<string, JSX.Element> = {
  github: <Github width={20} height={20} color="var(--text-primary)" />,
  link: <LinkIcon width={20} height={20} color="var(--text-primary)" />,
};

export const ProjectLinks = ({
  links,
}: {
  links: Array<{ id: number; title: string; url: string; icon: string | null }>;
}) => (
  <div className="flex flex-row gap-4">
    {links.map((link) => (
      <a
        key={link.id}
        href={link.url}
        className="flex w-fit items-center justify-center gap-2 text-nowrap rounded-lg border border-gray-400 px-3 py-2 text-sm font-medium tablet:text-base"
      >
        {(link.icon && ICON_MAP[link.title.toLowerCase()]) || (
          <LinkIcon width={20} height={20} color="var(--text-primary)" />
        )}
        {link.title}
      </a>
    ))}
  </div>
);
