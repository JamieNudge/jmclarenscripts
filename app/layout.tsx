import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const ADSENSE_CLIENT_ID =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? "ca-pub-6299348707363839";

export const metadata: Metadata = {
  title: "Jamie's App Portfolio",
  description: "Showcase of innovative mobile and desktop applications",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(ADSENSE_CLIENT_ID)}`}
          strategy="beforeInteractive"
          crossOrigin="anonymous"
        />
        {children}
      </body>
    </html>
  );
}


