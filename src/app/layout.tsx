import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
