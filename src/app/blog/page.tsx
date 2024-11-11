import { Suspense } from "react";
import ClientPage from "./_components/ClientPage";

export default function Page() {
  return (
    <div className="relative mx-auto flex size-full flex-col justify-between px-5 py-8 tablet:w-tablet tablet:px-0">
      <Suspense fallback={null}>
        <ClientPage />
      </Suspense>
    </div>
  );
}
