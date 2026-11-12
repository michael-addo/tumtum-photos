import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TUMTUM PHOTOS — Graduation Shoot Photography",
  description:
    "Graduation photography packages from GHC 400. Solo, duo, group, and on-location shoots. Book your session today.",
  keywords: [
    "graduation photography",
    "TUMTUM PHOTOS",
    "graduation shoot",
    "Ghana photography",
    "solo portraits",
    "graduation packages",
  ],
  authors: [{ name: "TUMTUM PHOTOS" }],
  creator: "TUMTUM PHOTOS",
  openGraph: {
    title: "TUMTUM PHOTOS — Graduation Shoot Photography",
    description:
      "Graduation photography packages from GHC 400. Solo, duo, group, and on-location shoots. Book your session today.",
    url: "https://tumtum-photos.vercel.app",
    siteName: "TUMTUM PHOTOS",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TUMTUM PHOTOS — Graduation Shoot",
      },
    ],
    locale: "en_GH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TUMTUM PHOTOS — Graduation Shoot Photography",
    description:
      "Graduation photography packages from GHC 400. Solo, duo, group, and on-location shoots.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://tumtum-photos.vercel.app"),
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-64.png", sizes: "64x64", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [
      { url: "/favicon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}