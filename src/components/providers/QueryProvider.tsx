/**
 * TanStack Query 프로바이더
 *
 * SSR: 요청마다 새 QueryClient 생성 (메모리 누수 방지)
 * CSR: 싱글톤 QueryClient 재사용 (상태 유지)
 */
"use client";

import { isServer, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (isServer) {
    // 서버: 항상 새로운 query client를 만듭니다.
    return makeQueryClient();
  }
  // 브라우저: 이미 없는 경우 새로운 query client를 만듭니다.
  return (browserQueryClient ??= makeQueryClient());
}

export default function Providers({ children }: React.PropsWithChildren) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
