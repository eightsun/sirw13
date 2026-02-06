import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SIRW13 - Sistem Informasi RW 13 Permata Discovery",
  description: "Sistem manajemen data warga, KK, dan rumah untuk RW 13 Permata Discovery",
  keywords: ["RW 13", "Permata Discovery", "sistem informasi", "warga"],
  authors: [{ name: "RW 13 Permata Discovery" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
