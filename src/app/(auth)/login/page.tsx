import GithubAuth from "./_components/GithubAuth";

export default async function Page() {
  return (
    <div className="mx-auto flex w-full grow flex-col items-center justify-center px-4 pb-[500px] pt-10 tablet:max-w-screen-tablet tablet:px-0 desktop:max-w-screen-desktop">
      <div className="flex size-full max-w-[520px]">
        <GithubAuth />
      </div>
    </div>
  );
}
