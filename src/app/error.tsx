"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <article className="mx-auto flex size-full grow flex-col items-center justify-center tablet:w-tablet">
      <span className="text-6xl">⚠️</span>
      <span className="mt-6 text-xl font-semibold tablet:text-3xl">문제가 발생했습니다</span>
      <p className="mt-3 text-gray-600">잠시 후 다시 시도해 주세요.</p>

      <div className="mt-6 flex gap-4 tablet:mt-16">
        <button
          onClick={reset}
          className="rounded-xl bg-blue-500 px-4 py-2 text-lg font-semibold text-white tablet:px-8 tablet:py-4 tablet:text-xl"
        >
          다시 시도
        </button>
        <Link
          href="/"
          className="rounded-xl bg-gray-200 px-4 py-2 text-lg font-semibold tablet:px-8 tablet:py-4 tablet:text-xl"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </article>
  );
}
