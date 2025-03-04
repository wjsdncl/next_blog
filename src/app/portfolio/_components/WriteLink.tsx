"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { getUser } from "@/services/user.api";
import { type User } from "@/types/AuthType";
import cookies from "@/utils/cookies";

export default function WriteLink() {
  const queryClient = useQueryClient();
  const accessToken = cookies.get("accessToken");

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: getUser,
    enabled: !!accessToken,
    retry: 0,
    initialData: () => {
      return queryClient.getQueryData<User>(["user"]);
    },
  });

  if (!user) return null;

  return (
    <Link
      href="/portfolio/write"
      className="flex h-[48px] w-fit items-center justify-center overflow-hidden text-nowrap rounded-full bg-brand_dark-tertiary px-4 font-medium text-text-primary"
    >
      포트폴리오 작성하기
    </Link>
  );
}
