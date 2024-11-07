import ClientPage from "./_components/ClientPage";

export default function Page() {
  return (
    <div className="mx-auto flex size-full flex-col justify-between py-10 tablet:w-tablet desktop:w-desktop">
      <ClientPage />
    </div>
  );
}
