import type { Metadata } from "next";
import { AdSenseRouteCleanup } from "@/components/AdSenseRouteCleanup";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

function siteMetadataBase(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    const normalized = explicit.replace(/\/+$/, "");
    return new URL(`${normalized}/`);
  }
  if (process.env.VERCEL_URL) return new URL(`https://${process.env.VERCEL_URL}`);
  return new URL("http://localhost:3000");
}

export const metadata: Metadata = {
  metadataBase: siteMetadataBase(),
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
        <AdSenseRouteCleanup />
        {children}
      </body>
    </html>
  );
}


