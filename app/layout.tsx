import type { Metadata } from "next";
import { AdSenseGlobalPlaceholder } from "@/components/AdSenseGlobalPlaceholder";
import { AdSenseRouteCleanup } from "@/components/AdSenseRouteCleanup";
import { AdSenseScriptGate } from "@/components/AdSenseScriptGate";
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

/** Same client as {@link AdSenseLoader} and `public/ads.txt` (AdSense / meta verification). */
const ADSENSE_CLIENT_ID =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim() || "ca-pub-6299348707363839";

export const metadata: Metadata = {
  metadataBase: siteMetadataBase(),
  title: "Jamie's App Portfolio",
  description: "Showcase of innovative mobile and desktop applications",
  other: {
    "google-adsense-account": ADSENSE_CLIENT_ID,
  },
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
        <AdSenseScriptGate />
        <AdSenseRouteCleanup />
        {children}
        <AdSenseGlobalPlaceholder />
      </body>
    </html>
  );
}


