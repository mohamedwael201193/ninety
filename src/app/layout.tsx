import type { Metadata } from "next";
import localFont from "next/font/local";
import { Providers } from "@/components/Providers";
import { SkipLink } from "@/components/SkipLink";
import { PAGES, SITE_URL } from "@/lib/site/meta";
import "./globals.css";

// Self-hosted (OFL), so the build never depends on fetching from Google Fonts.
const display = localFont({ src: [{ path: "./fonts/inter-tight-latin-500-normal.woff2", weight: "500", style: "normal" }, { path: "./fonts/inter-tight-latin-600-normal.woff2", weight: "600", style: "normal" }], variable: "--font-display-face", display: "swap" });
const sans = localFont({ src: [{ path: "./fonts/ibm-plex-sans-latin-400-normal.woff2", weight: "400", style: "normal" }, { path: "./fonts/ibm-plex-sans-latin-500-normal.woff2", weight: "500", style: "normal" }, { path: "./fonts/ibm-plex-sans-latin-600-normal.woff2", weight: "600", style: "normal" }], variable: "--font-sans-face", display: "swap" });
const mono = localFont({ src: [{ path: "./fonts/ibm-plex-mono-latin-400-normal.woff2", weight: "400", style: "normal" }, { path: "./fonts/ibm-plex-mono-latin-500-normal.woff2", weight: "500", style: "normal" }], variable: "--font-mono-face", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Canonical and Open Graph are set per page (src/lib/site/meta.ts), so the 404 page gets none.
  title: { default: PAGES["/"].title, template: "%s · Ninety" },
  description: PAGES["/"].description,
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
