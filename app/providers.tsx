"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ConfiguracoesProvider } from "@/contexts/ConfiguracoesContext";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

function HeroUIWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Forçar re-render quando o tema muda
  const key = mounted ? theme : "default";

  return (
    <HeroUIProvider key={key} navigate={router.push}>
      {children}
    </HeroUIProvider>
  );
}

export function Providers({ children, themeProps }: ProvidersProps) {
  return (
    <NextThemesProvider {...themeProps}>
      <AuthProvider>
        <ConfiguracoesProvider>
          <HeroUIWrapper>{children}</HeroUIWrapper>
        </ConfiguracoesProvider>
      </AuthProvider>
    </NextThemesProvider>
  );
}
