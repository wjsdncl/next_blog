import Image from "next/image";
import Link from "next/link";
import Navigation from "./_components/Navigation";
import SearchInput from "./_components/SearchInput";

export default function Page() {
  const id = 1;
  return (
    <div className="relative mx-auto flex size-full flex-col justify-between py-8 tablet:w-tablet">
      <Navigation />
      {/* 검색 */}
      <section className="flex items-center justify-end">
        <SearchInput />
      </section>

      <div className="pt-8" />

      {/* 게시글 */}
      <section className="flex flex-col gap-8">
        <article className="flex flex-col gap-4">
          <Link href={`/blog/${id}`} className="flex flex-col gap-4">
            {/* 이미지 */}
            <div className="relative flex h-96 w-full items-center justify-center">
              <Image src="/images/image.png" alt="React" className="object-cover" fill sizes="300" />
            </div>

            {/* 제목 */}
            <h2 className="text-4xl font-bold">
              <span className="pr-2">[카테고리]</span> 제목
            </h2>

            {/* 내용 */}
            <p className="line-clamp-4 text-lg">
              내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용
              내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용
              내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용
              내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용
              내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용
              내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용
              내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용
              내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용
              내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용
              내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용
              내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용
              내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용
              내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용
              내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용
              내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용
              내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용
              내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용
              내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용 내용
              내용 내용 내용 내용 내용 내용 내용 내용 내용 내용
            </p>
          </Link>

          {/* 태그 */}
          <div className="flex flex-wrap gap-3">
            <button type="button" className="rounded-md bg-gray-200 px-3 py-2 font-medium">
              태그
            </button>
          </div>

          <div className="flex gap-1 text-gray-500">
            <p>2021.09.30</p>
            <span>.</span>
            <p>댓글 0</p>
            <span>.</span>
            <p>좋아요 0</p>
          </div>
        </article>
      </section>

      <div className="fixed bottom-[70px] right-[16px] z-40 flex h-[48px] w-[130px] items-center justify-center overflow-hidden rounded-full tablet:right-[24px] desktop:right-[calc((100%-1200px)/2)]">
        <button
          type="button"
          className="flex size-full items-center justify-center bg-gray-200 text-text-primary hover:bg-gray-300 active:bg-gray-400"
        >
          <span>새 글 작성하기</span>
        </button>
      </div>
    </div>
  );
}
