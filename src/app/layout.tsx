import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kimiko | Solana Privacy Toolkit",
  description: "Compliant Privacy and Risk Analysis for Solana Wallets",
  icons: {
    icon: "/logo.svg",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} bg-[#050505] antialiased`}>{children}</body>
    </html>
  );
}
