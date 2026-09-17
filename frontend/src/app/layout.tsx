import type { Metadata } from "next";
import { Public_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PRISM — Parcel Recognition and Intelligent Spatial Mapping",
  description: "Turning drone photos into ready-to-use city land maps, automatically.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${publicSans.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans text-base text-ink bg-paper antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
