"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const Footer = () => {
  const pathname = usePathname();

  if (pathname === "/blog/write" || pathname === "/portfolio/write") {
    return <></>;
  }

  return (
    <footer className="flex h-[56px] items-center justify-center bg-gray-200 p-4 text-center">
      <article className="flex items-center justify-between gap-4 tablet:w-tablet desktop:w-desktop">
        <span className="text-nowrap font-medium">©wjdalswo 2026.</span>
        <div className="flex items-center justify-center gap-4 font-semibold">
          <Link href="https://github.com/wjsdncl" className="transition-colors duration-200 hover:text-brand-tertiary">
            Github
          </Link>
          {/* <Link href="/sitemap">Sitemap</Link> */}
          {/* <Link href="/contact">Contact</Link> */}
        </div>
      </article>
    </footer>
  );
};

export default Footer;
