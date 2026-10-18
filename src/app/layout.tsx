import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Inter_Tight } from "next/font/google";
import { Providers } from "@/components/Providers";
import { SkipLink } from "@/components/SkipLink";
import "./globals.css";

const display = Inter_Tight({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-display-face", display: "swap" });
const sans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-sans-face", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono-face", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Ninety — Schengen days left", template: "%s · Ninety" },
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
        <SkipLink />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
