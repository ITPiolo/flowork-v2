import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollSpine from "@/components/ScrollSpine";
import PageTransition from "@/components/PageTransition";
import WhatsAppButton from "@/components/WhatsAppButton";
import SmoothScroll from "@/components/SmoothScroll";
import { createClient } from "@/lib/supabase/server";
import type { Location } from "@/lib/supabase/types";

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
  title: {
    default: "flowork | Workspaces That Elevate Your Business",
    template: "%s | flowork",
  },
  description:
    "Premium private offices, coworking, meeting rooms, and virtual offices in Dubai Hills and Business Bay.",
  openGraph: {
    siteName: "flowork",
    type: "website",
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
        <SmoothScroll />
        <ScrollSpine />
        <Header locations={(locations ?? []) as Location[]} />
        <main>
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}