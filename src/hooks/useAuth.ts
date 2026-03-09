"use client";

import { useQuery } from "@tanstack/react-query";
import { getUser, USER_KEYS } from "@/services/user.api";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: [...USER_KEYS],
    queryFn: getUser,
    retry: 0,
    staleTime: 1000 * 60 * 5,
  });

  const isOwner = user?.role === "OWNER";
  const isLoggedIn = !!user;

  return { user, isOwner, isLoggedIn, isLoading };
}
