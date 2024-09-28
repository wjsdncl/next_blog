import { Suspense } from "react";
import ClientPage from "./_components/ClientPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ClientPage />
    </Suspense>
  );
}
