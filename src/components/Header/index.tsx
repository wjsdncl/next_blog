"use server";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cookies } from "next/headers";
import { getUser } from "@/services/user.api";
import getQueryClient from "../QueryClient";
import ClientHeader from "./client";

export default async function Header() {
  const queryClient = getQueryClient({});

  const accessToken = cookies().get("accessToken");
  if (accessToken) {
    await queryClient.prefetchQuery({
      queryKey: ["user"],
      queryFn: () => {
        getUser();
      },
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClientHeader />
    </HydrationBoundary>
  );
}
