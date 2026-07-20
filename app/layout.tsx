import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollSpine from "@/components/ScrollSpine";
import PageTransition from "@/components/PageTransition";
import WhatsAppButton from "@/components/WhatsAppButton";
import Preloader from "@/components/Preloader";
import { Analytics } from "@vercel/analytics/react";
import { createClient } from "@/lib/supabase/server";
import type { Location } from "@/lib/supabase/types";
import StructuredData from "@/components/StructuredData";
import TrackingPixels from "@/components/TrackingPixels";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://flowork-v2-gold.vercel.app"),
  title: {
    default: "flowork | Workspaces That Elevate Your Business",
    template: "%s | flowork",
  },
  description:
    "Premium private offices, coworking, meeting rooms, and virtual offices in Dubai Hills and Business Bay.",
  openGraph: {
    siteName: "flowork",
    type: "website",
    images: ["/images/Reception-01-rd-1536x1182.jpg"],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: locations } = await supabase
    .from("locations")
    .select("*")
    .order("display_order");

  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        <StructuredData />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[500] focus:bg-sage-500 focus:text-cream focus:px-4 focus:py-2 focus:rounded-full"
        >
          Skip to main content
        </a>
        <Preloader />
        <ScrollSpine />
        <Header locations={(locations ?? []) as Location[]} />
        <main id="main-content">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
        <WhatsAppButton />
        <Analytics />
      </body>
    </html>
  );
}