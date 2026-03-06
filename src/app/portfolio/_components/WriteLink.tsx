"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { getUser, USER_KEYS } from "@/services/user.api";

export default function WriteLink() {
  const { data: user } = useQuery({
    queryKey: [...USER_KEYS],
    queryFn: getUser,
    retry: 0,
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
