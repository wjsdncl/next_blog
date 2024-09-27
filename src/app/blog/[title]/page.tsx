import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import ClientPage from "./_components/ClientPage";
import { getPost } from "@/services/post.api";

export default async function Page({ params }: { params: { title: string } }) {
  const queryClient = new QueryClient();
  const title = params.title as string;

  await queryClient.prefetchQuery({
    queryKey: ["post", title],
    queryFn: async () => getPost(title),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClientPage title={title} />
    </HydrationBoundary>
  );
}
