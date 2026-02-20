"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RegisterForm() {
  const router = useRouter();

  // OAuth 전용 백엔드이므로 회원가입 페이지는 로그인 페이지로 리다이렉트
  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <div className="flex items-center justify-center p-8">
      <p className="text-lg text-text-primary">로그인 페이지로 이동 중...</p>
    </div>
  );
}
