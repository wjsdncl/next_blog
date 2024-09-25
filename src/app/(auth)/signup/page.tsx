import Link from "next/link";
import RegisterForm from "./_components/Form";

function App() {
  return (
    <div className="mx-auto px-4 tablet:max-w-screen-tablet tablet:px-0 desktop:max-w-screen-desktop">
      <div className="pt-20" />
      <h1 className="flex w-full items-center justify-center text-[40px] font-extrabold text-text-primary">회원가입</h1>
      <section className="flex w-full items-center justify-center">
        <div className="max-w-[520px] grow">
          <RegisterForm />

          <div className="pt-5" />

          <div className="flex w-full items-center justify-center">
            <p>
              계정이 있다면{"\u00A0"}
              <Link
                href={"/login"}
                className="font-semibold text-brand_dark-secondary underline dark:text-brand-secondary"
              >
                로그인하기
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
