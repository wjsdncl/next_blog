import AuthCallback from "./_components/AuthCallback";

export default async function Page({ searchParams }: { searchParams: { provider: string } }) {
  const { provider } = searchParams;

  return (
    <div className="mx-auto px-4 tablet:max-w-screen-tablet tablet:px-0 desktop:max-w-screen-desktop">
      <AuthCallback provider={provider} />
    </div>
  );
}
