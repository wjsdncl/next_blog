"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingOverlay from "@/components/feedback/LoadingOverlay";
import { revalidateUser } from "@/services/actions/revalidate.action";
import toast from "@/utils/toast";

export default function AuthCallback({ provider }: { provider: string }) {
  const router = useRouter();

  useEffect(() => {
    const handleLogin = async () => {
      if (!provider) {
        toast.error("로그인 처리 중 오류가 발생했습니다.");
        router.replace("/");
        return;
      }

      await revalidateUser();
      toast.success("로그인에 성공했습니다.", 2000);
      router.replace("/");
    };

    handleLogin();
  }, [provider, router]);

  return <LoadingOverlay />;
}
