"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_request: "잘못된 요청입니다.",
  invalid_state: "인증 상태가 유효하지 않습니다. 다시 시도해주세요.",
  invalid_provider: "지원하지 않는 로그인 방식입니다.",
  account_inactive: "비활성화된 계정입니다. 관리자에게 문의해주세요.",
  oauth_failed: "로그인 처리 중 오류가 발생했습니다.",
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message") ?? "oauth_failed";
  const errorMessage = ERROR_MESSAGES[message] ?? ERROR_MESSAGES.oauth_failed;

  return (
    <div className="flex flex-col items-center gap-6">
      <h1 className="text-3xl font-bold text-text-primary">로그인 실패</h1>
      <p className="text-lg text-gray-500">{errorMessage}</p>
      <Link
        href="/login"
        className="rounded-md bg-brand-primary px-6 py-3 text-base font-medium text-text-primary hover:bg-brand-secondary"
      >
        다시 로그인하기
      </Link>
    </div>
  );
}

export default function Page() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Suspense>
        <AuthErrorContent />
      </Suspense>
    </div>
  );
}
