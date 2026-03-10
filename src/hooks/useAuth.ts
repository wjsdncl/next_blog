"use client";

import { useQuery } from "@tanstack/react-query";
import { getUser, USER_KEYS } from "@/services/user.api";

function hasLoginCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((c) => c.startsWith("is_logged_in="));
}

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: [...USER_KEYS],
    queryFn: getUser,
    retry: 0,
    staleTime: 1000 * 60 * 5,
    enabled: hasLoginCookie(),
  });

  const isOwner = user?.role === "OWNER";
  const isLoggedIn = !!user;

  return { user, isOwner, isLoggedIn, isLoading };
}
