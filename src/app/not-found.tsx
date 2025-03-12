import Link from "next/link";
import { NotFound } from "@/Icons/NotFound";

export default function Page() {
  return (
    <article className="mx-auto flex size-full grow flex-col items-center justify-center tablet:w-tablet">
      <NotFound height={"auto"} width={"50%"} />
      <span className="mt-6 text-xl font-semibold tablet:text-3xl">해당 페이지를 찾을 수 없습니다!</span>

      <Link
        href="/"
        className="ml-4 mt-6 rounded-xl bg-gray-200 px-4 py-2 text-lg font-semibold tablet:mt-16 tablet:px-8 tablet:py-4 tablet:text-xl"
      >
        홈으로 돌아가기
      </Link>
    </article>
  );
}
