import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
