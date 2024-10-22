import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import axios from "axios";

import type { Metadata } from "next";

import dynamic from "next/dynamic";
import localFont from "next/font/local";
import { cookies } from "next/headers";

import "@/styles/globals.css";

import Header from "@/components/Header";
import getQueryClient from "@/components/QueryClient";
import QueryProvider from "@/components/QueryProvider";
import ThemeProvider from "@/components/ThemeProvider";

const Footer = dynamic(() => import("@/components/Footer"));
const Modal = dynamic(() => import("@/components/Modal"));
const Toaster = dynamic(() => import("@/components/Toaster"));

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

export default async function RootLayout({ children }: Readonly<React.PropsWithChildren>) {
  const queryClient = getQueryClient({ staleTime: 60 * 1000 });

  const accessToken = cookies().get("accessToken")?.value ?? "";

  if (accessToken) {
    await queryClient.prefetchQuery({
      queryKey: ["user"],
      queryFn: async () => {
        try {
          const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/users/me`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          return res.data;
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error("Error fetching user:", error);
          throw new Error("Failed to fetch user");
        }
      },
    });
  }

  return (
    <html lang="ko" className={pretendard.variable}>
      <body className="size-full min-h-dvh bg-background-primary font-pretendard text-text-primary">
        <ThemeProvider>
          <QueryProvider>
            <HydrationBoundary state={dehydrate(queryClient)}>
              <Header />
              <main className="min-h-[calc(100dvh-276px)] w-full">{children}</main>
              <Footer />
              <Modal />
              <Toaster />
            </HydrationBoundary>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
