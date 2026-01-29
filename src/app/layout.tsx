import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import Link from "next/link";

import { ThemeProvider } from "@/components/theme-provider";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Polaris",
  description: "Polaris Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${plexMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <header className="flex items-center gap-4 p-4">
            <Link href="/sign-in">
              <button className="px-4 py-2 text-sm font-medium hover:bg-accent rounded-md">
                Sign in
              </button>
            </Link>
            <Link href="/sign-up">
              <button className="px-4 py-2 text-sm font-medium bg-rose-500 text-white rounded-md hover:bg-rose-600">
                Sign Up
              </button>
            </Link>
          </header>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
