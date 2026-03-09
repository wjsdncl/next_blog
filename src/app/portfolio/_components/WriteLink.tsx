"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function WriteLink() {
  const { isOwner } = useAuth();

  if (!isOwner) return null;

  return (
    <Link
      href="/portfolio/write"
      className="flex h-[48px] w-fit items-center justify-center overflow-hidden text-nowrap rounded-full bg-brand_dark-tertiary px-4 font-medium text-text-primary"
    >
      포트폴리오 작성하기
    </Link>
  );
}
