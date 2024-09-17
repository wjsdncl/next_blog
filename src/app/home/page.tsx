export default function Page() {
  return (
    <div className="flex h-full w-mobile flex-col justify-between py-10 tablet:w-tablet desktop:w-desktop">
      <section className="flex grow flex-col gap-7 text-center">
        <span className="text-3xl">프론트엔드 개발자 블로그</span>
        <span className="text-xl">여기에는 블로그 메인글, 인기글이 들어갈 예정입니다</span>
      </section>

      <section className="relative bottom-0 flex flex-col text-right">
        <span>연락처</span>
        <span>Email: wjsdncl2222@gmail.com</span>
        <span>wlke12@naver.com</span>
      </section>
    </div>
  );
}
