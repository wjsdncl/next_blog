import Image from "next/image";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const components = {
  code({
    inline,
    className,
    children,
    ...props
  }: {
    inline?: boolean;
    className?: string;
    children?: string | string[];
  }) {
    const match = /language-(\w+)/.exec(className || "");
    const language = match ? match[1] : "";

    const isValidLanguage = Boolean(language && SyntaxHighlighter.supportedLanguages.includes(language));

    return !inline && language ? (
      <SyntaxHighlighter style={oneDark} language={isValidLanguage ? language : "text"} PreTag="div" {...props}>
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  img: ({ src, alt, ...props }: { src?: string; alt?: string }) =>
    src ? (
      <span className="relative block max-w-full">
        <Image
          src={src}
          alt={alt ?? "이미지"}
          width={0}
          height={0}
          sizes="100vw"
          className="size-auto max-w-full object-contain"
          {...props}
        />
      </span>
    ) : null,
};

export default components;
