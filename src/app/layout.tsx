import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { startHourlyRatesUpdater } from "@/lib/utils";

if (typeof window === 'undefined') {
  try { startHourlyRatesUpdater(false) } catch {}
}
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Personal Finance Tracker",
  description: "Track your finances, manage assets, and achieve your financial goals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
