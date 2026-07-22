import type { Metadata } from "next";
import { headers } from "next/headers";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { AdSenseRouteCleanup } from "@/components/AdSenseRouteCleanup";
import { AdSenseScriptGate } from "@/components/AdSenseScriptGate";
import { HubNavProvider } from "@/components/hub/HubNavContext";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const h = await headers();
  const hostHeader = h.get("x-forwarded-host") ?? h.get("host");
  const requestHost = hostHeader?.split(":")[0] ?? "";
  /** Crawlers (AdSense verification) read initial HTML; client-only injectors are not enough. */
  const adsenseInitial = h.get("x-adsense-initial") === "1";
  const isGoalLabHub = h.get("x-goal-lab-hub") === "1";
  const adsenseSrc = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(ADSENSE_CLIENT_ID)}`;

  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <HubNavProvider isGoalLabHub={isGoalLabHub}>
          {adsenseInitial ? (
            <Script
              id="adsbygoogle-initial"
              src={adsenseSrc}
              strategy="beforeInteractive"
              crossOrigin="anonymous"
            />
          ) : null}
          <BestPicksDocumentRouteClass />
          <AdSenseScriptGate requestHost={requestHost} />
          <AdSenseRouteCleanup />
          {children}
          <Analytics />
        </HubNavProvider>
      </body>
    </html>
  );
}


