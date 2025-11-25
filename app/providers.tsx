"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Provider as ReduxProvider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { store } from "@/lib/store/store";
import { TokenRefreshProvider } from "@/components/TokenRefreshProvider";

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

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  return (
    <ReduxProvider store={store}>
      <HeroUIProvider navigate={router.push}>
        <NextThemesProvider {...themeProps}>
          <TokenRefreshProvider>
            {children}
            <Toaster 
              position="top-right"
              toastOptions={{
                style: {
                  background: '#0a0e12',
                  color: '#fff',
                  border: '1px solid rgba(0, 178, 222, 0.3)',
                },
                success: {
                  iconTheme: {
                    primary: '#00b2de',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </TokenRefreshProvider>
        </NextThemesProvider>
      </HeroUIProvider>
    </ReduxProvider>
  );
}
