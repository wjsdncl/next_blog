import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { getUser, USER_KEYS } from "@/services/user.api";
import MarkdownEditor from "./_components/MarkdownEditor";

export default async function Page({ searchParams }: { searchParams: { title: string } }) {
  const queryClient = new QueryClient();
  const user = await getUser();

  queryClient.setQueryData([...USER_KEYS], user);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MarkdownEditor slug={searchParams.title} />
    </HydrationBoundary>
  );
}
