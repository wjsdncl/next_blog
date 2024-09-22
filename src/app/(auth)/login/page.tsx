import LoginForm from "./_components/Form";

export default function Page() {
  return (
    <div className="mx-auto px-4 tablet:max-w-screen-tablet tablet:px-0 desktop:max-w-screen-desktop">
      <div className="pt-20" />
      <h1 className="flex w-full items-center justify-center text-[40px] font-extrabold text-text-primary">로그인</h1>
      <section className="flex w-full items-center justify-center">
        <div className="max-w-[520px] grow">
          <LoginForm />
        </div>
      </section>
    </div>
  );
}
