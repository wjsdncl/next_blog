import type { Metadata } from "next";

import "@/styles/globals.css";

import localFont from "next/font/local";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import QueryProvider from "@/components/QueryProvider";
import ThemeProvider from "@/components/ThemeProvider";
import Toaster from "@/components/Toaster";

const pretendard = localFont({
  src: "../../public/fonts/PretendardVariable.woff2",
  display: "swap",
  weight: "45 920",
  variable: "--font-pretendard",
});

export const metadata: Metadata = {
  title: "개발 블로그",
  description: "next.js로 만든 개발 블로그입니다.",
};

export default function RootLayout({ children }: Readonly<React.PropsWithChildren>) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body className="size-full min-h-dvh bg-background-primary font-pretendard text-text-primary">
        <ThemeProvider>
          <QueryProvider>
            <Header />
            <main className="min-h-[calc(100dvh-276px)] w-full">{children}</main>
            <Footer />
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
