/* eslint-disable @tanstack/query/exhaustive-deps */
/* eslint-disable no-console */
"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SignInWithGithubCallback } from "@/services/auth.api";
import toast from "@/utils/Toast";

export default function AuthCallback({ code }: { code: string }) {
  const router = useRouter();

  const { isSuccess, isError, error } = useQuery({
    queryKey: ["user"],
    queryFn: () => {
      const id = toast.loading("GitHub 계정으로 로그인 중...");

      return SignInWithGithubCallback(code)
        .then((result) => {
          toast.updateToast(id, "로그인에 성공했습니다.", "success", 2000);
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

  useEffect(() => {
    if (isSuccess) {
      localStorage.setItem("isLoggedIn", "true");

      router.push("/");
    }

    if (isError) {
      console.error("로그인 중 오류 발생:", error);
    }
  }, [isSuccess, isError, error, router]);

  return null;
}
