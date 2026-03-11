"use client";

import { useQuery } from "@tanstack/react-query";
import { getUser, USER_KEYS } from "@/services/user.api";
import { TOKEN_NAMES } from "@/utils/token";

function hasLoginCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((c) => c.startsWith(`${TOKEN_NAMES.LOGGED_IN}=`));
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
