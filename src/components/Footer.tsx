import Link from "next/link";

const Footer = () => {
  return (
    <footer className="flex h-[56px] items-center justify-center bg-_gray-200 py-4 text-center dark:bg-_gray-900">
      <article className="flex items-center justify-between gap-4 mobile:w-mobile tablet:w-tablet desktop:w-desktop">
        <span className="font-medium">©wjsdncl 2024.</span>
        <div className="flex items-center justify-center gap-4 font-semibold">
          <Link href="https://github.com/wjsdncl">Github</Link>
          <Link href="/sitemap">Sitemap</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </article>
    </footer>
  );
};

export default Footer;
