/**
 * React Markdown 커스텀 렌더러
 *
 * code: 언어 지정 시 SyntaxHighlighter(oneDark), 미지정 시 인라인 코드
 * img: alt 텍스트에 {width}x{height} 포함 시 해당 크기로 렌더링
 *      예: ![설명{600x400}](url) → 600×400px
 */
import Image from "next/image";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface ImageSize {
  width: number;
  height: number;
}

/** alt 텍스트에서 {width}x{height} 패턴 추출 */
const parseImageSize = (alt?: string): ImageSize | null => {
  const match = alt?.match(/{(\d+)x(\d+)}/);
  if (!match) return null;

  return {
    width: parseInt(match[1], 10),
    height: parseInt(match[2], 10),
  };
};

const components = {
  code({
    inline,
    className,
    children,
    ...props
  }: {
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
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
  img: ({ src = "", alt, ...props }: { src?: string; alt?: string }) => {
    // alt 텍스트에서 크기 정보 파싱
    const sizeInfo = parseImageSize(alt);

    // alt 텍스트에서 크기 정보 제거
    const cleanAlt = alt?.replace(/{(\d+)x(\d+)}/, "").trim();

    return (
      <span className="relative my-4 block max-w-full">
        <Image
          src={src}
          alt={cleanAlt ?? "이미지"}
          width={0}
          height={0}
          sizes="100vw"
          className="size-auto max-h-[720px] max-w-full object-contain"
          loading="eager"
          style={
            sizeInfo
              ? {
                  width: sizeInfo.width,
                  ...(sizeInfo.height ? { height: sizeInfo.height } : {}),
                }
              : undefined
          }
          {...props}
        />
      </span>
    );
  },
};

export default components;
