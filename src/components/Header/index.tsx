"use server";

import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { cookies } from "next/headers";
import { getUser, USER_TAG } from "@/services/user.api";
import ClientHeader from "./client";

export default async function Header() {
  const queryClient = new QueryClient();

  const accessToken = cookies().get("accessToken");
  if (accessToken) {
    await queryClient.prefetchQuery({
      queryKey: USER_TAG,
      queryFn: getUser,
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClientHeader />
    </HydrationBoundary>
  );
}
