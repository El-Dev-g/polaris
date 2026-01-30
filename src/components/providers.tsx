"use client";

import { 
  ConvexReactClient,
  ConvexProvider,
} from "convex/react";
import { SessionProvider, useSession } from "next-auth/react";

import { ThemeProvider } from "./theme-provider";
import { AuthLoadingView } from "@/features/auth/components/auth-loading-view";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL || "");

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const { status } = useSession();

  if (status === "loading") {
    return <AuthLoadingView />;
  }

  // We are not using Convex's Authenticated/Unauthenticated wrappers here
  // because we handle redirection at the page and middleware levels.
  // Note: For full Convex integration, a JWT should be provided to Convex.
  return <>{children}</>;
}

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <ConvexProvider client={convex}>
         <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthWrapper>
            {children}
          </AuthWrapper>
        </ThemeProvider>
      </ConvexProvider>
    </SessionProvider>
  );
};
