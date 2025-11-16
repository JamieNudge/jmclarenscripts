import type { Metadata } from "next";
import "./globals.css";

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
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

