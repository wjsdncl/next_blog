export default function HomePage() {
  return (
    <main className="min-h-[calc(100dvh-276px)] bg-_white dark:bg-_black">
      <div className="mx-auto my-0 flex h-full flex-col justify-between bg-_white py-10 dark:bg-_black mobile:w-mobile tablet:w-tablet desktop:w-desktop">
        <section className="flex grow flex-col gap-7 text-center">
          <span className="text-3xl">프론트엔드 개발자 블로그</span>
          <span className="text-xl">여기에는 블로그 메인글, 인기글이 들어갈 예정입니다</span>

          <textarea
            className="h-40 w-full rounded-md border-2 border-gray-300 p-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder="댓글을 입력해주세요"
          ></textarea>
        </section>

        <section className="relative bottom-0 flex flex-col text-right">
          <span>연락처</span>
          <span>Email: wjsdncl2222@gmail.com</span>
          <span>wlke12@naver.com</span>
        </section>
      </div>
    </main>
  );
}
