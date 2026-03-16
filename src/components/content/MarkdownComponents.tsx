/**
 * React Markdown 커스텀 렌더러
 *
 * code: 언어 지정 시 SyntaxHighlighter(oneDark), 미지정 시 인라인 코드
 * img: 네이티브 <img> 사용 (외부 도메인 제한 없음)
 *      alt 텍스트에 {width}x{height} 포함 시 해당 크기로 렌더링
 *      예: ![설명{600x400}](url) → 600×400px
 */
import dynamic from "next/dynamic";

const CodeBlock = dynamic(() => import("./CodeBlock"), {
  ssr: false,
  loading: () => <div className="my-4 rounded-md bg-[#282c34] p-4 text-sm text-gray-300">Loading...</div>,
});

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

    return !inline && language ? (
      <CodeBlock language={language}>{String(children).replace(/\n$/, "")}</CodeBlock>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  img: ({ src = "", alt }: { src?: string; alt?: string }) => {
    const sizeInfo = parseImageSize(alt);
    const cleanAlt = alt?.replace(/{(\d+)x(\d+)}/, "").trim();

    return (
      <span className="my-4 block max-w-full">
        <img
          src={src}
          alt={cleanAlt ?? "이미지"}
          loading="lazy"
          decoding="async"
          className="max-h-[720px] max-w-full object-contain"
          {...(sizeInfo && { width: sizeInfo.width, height: sizeInfo.height })}
        />
      </span>
    );
  },
};

export default components;
