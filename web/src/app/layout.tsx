import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { SessionProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { CookieBanner } from "@/components/consent/cookie-banner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ExoChat",
  description: "Open-source, self-hosted, end-to-end encrypted chat platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider>
            {children}
            <CookieBanner />
            <footer className="border-t py-4 text-center text-xs text-muted-foreground">
              <div className="flex items-center justify-center gap-4">
                <Link href="/impressum" className="hover:underline">
                  Impressum
                </Link>
                <Link href="/datenschutz" className="hover:underline">
                  Datenschutzerklaerung
                </Link>
              </div>
            </footer>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
