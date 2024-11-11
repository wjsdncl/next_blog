import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import axios from "axios";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";
import ClientPage from "./_components/ClientPage";
import getQueryClient from "@/components/QueryClient";

export default async function Page({ params }: { params: { title: string } }) {
  const queryClient = getQueryClient({ staleTime: 60 * 1000 });
  const title = params.title as string;

  const accessToken = cookies().get("accessToken")?.value ?? "";

  await queryClient.prefetchQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["post", title],
    queryFn: async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/posts/${title}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        return response.data;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error fetching post:", error);
        throw new Error("Failed to fetch post");
      }
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="relative mx-auto flex size-full flex-col justify-between px-5 py-8 text-lg tablet:w-tablet tablet:px-0">
        <Suspense>
          <ClientPage title={title} />
        </Suspense>
      </div>
    </HydrationBoundary>
  );
}

export async function generateMetadata({ params }: { params: { title: string } }): Promise<Metadata> {
  const decodedTitle = decodeURIComponent(params.title).replace(/-/g, " ");

  try {
    return {
      title: `${decodedTitle} | JMJ's Devlog`,
      description: `${decodedTitle}에 대한 블로그 게시글`,
      openGraph: {
        title: `${decodedTitle} | JMJ's Devlog`,
        description: `${decodedTitle}에 대한 블로그 게시글`,
        type: "article",
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch (error) {
    return {
      title: "블로그 게시글을 찾을 수 없습니다. | JMJ's Devlog",
      description: "블로그 게시글을 찾을 수 없습니다.",
    };
  }
}
