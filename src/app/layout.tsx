import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Inter_Tight } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const display = Inter_Tight({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-display-face", display: "swap" });
const sans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-sans-face", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono-face", display: "swap" });

export const metadata: Metadata = {
  title: "Ninety — Schengen days left",
  description:
    "How many Schengen days do you really have left? A 90/180 count rebuilt from your trips.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <a href="#check" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-pill focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">
          Skip to calculator
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
