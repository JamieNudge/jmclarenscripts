import type { Metadata } from "next";
import { AdSenseRouteCleanup } from "@/components/AdSenseRouteCleanup";
import { BestPicksDocumentRouteClass } from "@/components/best-picks/BestPicksDocumentRouteClass";
import { inter } from "@/lib/fonts";
import "./globals.css";

function siteMetadataBase(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    const normalized = explicit.replace(/\/+$/, "");
    return new URL(`${normalized}/`);
  }
  // Prefer stable production host so og:image matches the URL people share (jmclarenscripts.vercel.app),
  // not VERCEL_URL (unique per deployment: jmclarenscripts-xxxx.vercel.app).
  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (productionHost) {
    const host = productionHost.replace(/^https?:\/\//, "").replace(/\/+$/, "");
    return new URL(`https://${host}/`);
  }
  if (process.env.VERCEL_URL) {
    return new URL(`https://${process.env.VERCEL_URL}/`);
  }
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
        <BestPicksDocumentRouteClass />
        <AdSenseRouteCleanup />
        {children}
      </body>
    </html>
  );
}


