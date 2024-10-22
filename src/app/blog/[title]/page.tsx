import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import axios from "axios";
import { cookies } from "next/headers";
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
      <ClientPage title={title} />
    </HydrationBoundary>
  );
}
