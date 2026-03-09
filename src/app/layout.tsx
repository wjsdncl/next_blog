import type { Metadata } from "next";

import dynamic from "next/dynamic";
import localFont from "next/font/local";

import "@/styles/globals.css";

import Header from "@/components/layout/Header";
import QueryProvider from "@/components/providers/QueryProvider";

const Footer = dynamic(() => import("@/components/layout/Footer"));
const Modal = dynamic(() => import("@/components/layout/Modal"));
const Toaster = dynamic(() => import("@/components/feedback/Toaster"));

const pretendard = localFont({
  src: "../../public/fonts/PretendardVariable.woff2",
  display: "swap",
  weight: "45 920",
  variable: "--font-pretendard",
});

export const metadata: Metadata = {
  title: "개발 블로그 | wjdalswo Devlog",
  description: "개발 블로그 및 포트폴리오 사이트입니다.",
  keywords:
    "next.js, react, typescript, tailwindcss, prettier, eslint, blog, portfolio, web development, frontend, backend, fullstack, 블로그, 포트폴리오, 웹 개발, 프론트엔드, 백엔드, 풀스택, 개발, 프로그래밍",
  openGraph: {
    title: "개발 블로그 | wjdalswo Devlog",
    description: "개발 블로그 및 포트폴리오 사이트입니다.",
    url: "https://wjsdncl-dev-hub.vercel.app/",
    type: "website",
    locale: "ko_KR",
    siteName: "wjdalswo Devlog",
    images: [
      {
        url: "/images/meta.webp",
        width: 630,
        height: 630,
        alt: "개발 블로그 메타 이미지",
      },
    ],
  },
  robots: "index, follow",
  alternates: {
    canonical: "https://wjsdncl-dev-hub.vercel.app/",
  },
};

export default async function RootLayout({ children }: Readonly<React.PropsWithChildren>) {
  return (
    <html lang="ko" className={`${pretendard.variable} dark`}>
      <body className="size-full min-h-dvh bg-background-primary font-pretendard text-text-primary">
        <QueryProvider>
          <Header />
          <main className="flex h-full min-h-[calc(100dvh-166px-56px)] flex-col tablet:min-h-[calc(100dvh-186px-56px)]">
            {children}
          </main>
          <Footer />
          <Modal />
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
