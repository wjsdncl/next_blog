/* eslint-disable @tanstack/query/exhaustive-deps */
/* eslint-disable no-console */
"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { handleOAuthCallback } from "@/services/auth.api";
import { revalidateUser } from "@/services/server.action";
import { USER_KEYS } from "@/services/user.api";
import cookies from "@/utils/cookies";
import toast from "@/utils/Toast";

export default function AuthCallback({ code }: { code: string }) {
  const router = useRouter();

  const handleRevalidate = async () => {
    await revalidateUser();
  };

  useQuery({
    queryKey: [...USER_KEYS],
    queryFn: () => {
      const id = toast.loading("GitHub 계정으로 로그인 중...");

      return handleOAuthCallback(code)
        .then((result) => {
          toast.updateToast(id, "로그인에 성공했습니다.", "success", 2000);

          cookies.set("accessToken", result.accessToken, 3);
          cookies.set("refreshToken", result.refreshToken, 7);

          handleRevalidate();

          router.push("/");
          return result.user;
        })
        .catch((err) => {
          const errorMessage = err.message || "알 수 없는 오류가 발생했습니다.";
          toast.updateToast(id, `로그인 실패: ${errorMessage}`, "error", 2000);
          throw err;
        });
    },
    enabled: !!code,
    retry: false,
  });

  return null;
}
