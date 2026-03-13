"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function CodeBlock({ language, children }: { language: string; children: string }) {
  return (
    <SyntaxHighlighter style={oneDark} language={language} PreTag="div">
      {children}
    </SyntaxHighlighter>
  );
}
