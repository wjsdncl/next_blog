import { type Metadata } from "next";
import { Suspense } from "react";
import ClientPage from "./_components/ClientPage";

export default function Page() {
  return (
    <div className="relative mx-auto flex size-full flex-col justify-between px-5 py-8 tablet:w-tablet tablet:px-0">
      <Suspense fallback={null}>
        <ClientPage />
      </Suspense>
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    return {
      title: "블로그 게시글 목록 | JMJ's Devlog",
      description: "JMJ의 개발 블로그 게시글 목록입니다.",
      openGraph: {
        title: "블로그 게시글 목록 | JMJ's Devlog",
        description: "JMJ의 개발 블로그 게시글 목록입니다.",
        url: `https://wjsdncl-dev-hub.vercel.app/blog/`,
        type: "website",
      },
      robots: {
        index: true,
        follow: true,
      },
      alternates: {
        canonical: "https://wjsdncl-dev-hub.vercel.app/blog/",
      },
    };
  } catch (error) {
    return {
      title: "블로그 포스트",
      description: "블로그 포스트를 찾을 수 없습니다.",
    };
  }
}
