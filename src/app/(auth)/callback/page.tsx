import AuthCallback from "./_components/AuthCallback";

export default async function Page({ searchParams }: { searchParams: { code: string } }) {
  const { code } = searchParams;

  return (
    <div className="mx-auto px-4 tablet:max-w-screen-tablet tablet:px-0 desktop:max-w-screen-desktop">
      <AuthCallback code={code} />
    </div>
  );
}
