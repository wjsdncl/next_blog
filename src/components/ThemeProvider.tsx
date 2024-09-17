"use client";

import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";

export default function Provider({ children }: Readonly<React.PropsWithChildren>) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      {children}
    </ThemeProvider>
  );
}
