"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { revalidateUser } from "@/services/server.action";
import toast from "@/utils/Toast";

export default function AuthCallback({ provider }: { provider: string }) {
  const router = useRouter();

  useEffect(() => {
    const handleLogin = async () => {
      if (!provider) {
        toast.error("로그인 처리 중 오류가 발생했습니다.");
        router.push("/");
        return;
      }

      toast.success("로그인에 성공했습니다.", 2000);
      await revalidateUser();
      router.push("/");
    };

    handleLogin();
  }, [provider, router]);

  return null;
}
