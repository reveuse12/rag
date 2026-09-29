import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Roboto, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { StructuredData } from "@/components/structured-data";

const nunitoSansHeading = Nunito_Sans({ subsets: ['latin'], variable: '--font-heading' });
const roboto = Roboto({ subsets: ['latin'], variable: '--font-sans' });
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://citycircle-surat.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CityCircle Surat — Verified Local Community, Tech Mixers & Meetups",
    template: "%s | CityCircle Surat",
  },
  description:
    "CityCircle Surat is the verified, hyper-local community platform connecting builders, tech founders, outdoor trekkers, foodies, and university alumni across Surat with real-time chat and interactive Google Maps.",
  keywords: [
    "CityCircle Surat",
    "Surat Tech Meetups",
    "Surat Startup Community",
    "Weekend Trekkers Surat",
    "Surat Foodies Club",
    "SVNIT Alumni Network",
    "Surat Events & Meetups",
    "Local Communities in Gujarat",
    "Vesu Cafes Meetups",
  ],
  authors: [{ name: "Prayag Bagtharia", url: siteUrl }],
  creator: "Prayag Bagtharia",
  publisher: "CityCircle Community",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "CityCircle Surat",
    title: "CityCircle Surat — Verified Local Community & Tech Meetups",
    description:
      "Connect with local founders, developers, foodies, and outdoor enthusiasts in Surat. Join active circles, chat in real-time, and RSVP to offline meetups.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&h=630&q=85",
        width: 1200,
        height: 630,
        alt: "CityCircle Surat Community Meetups",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CityCircle Surat — Verified Local Community & Tech Meetups",
    description:
      "Connect with local founders, developers, foodies, and outdoor enthusiasts in Surat. Join active circles, chat in real-time, and RSVP to offline meetups.",
    images: ["https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&h=630&q=85"],
    creator: "@citycircle",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
    types: {
      'text/markdown': `${siteUrl}/llms.txt`,
    },
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CityCircle",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", roboto.variable, nunitoSansHeading.variable)}
    >
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="alternate" type="text/markdown" title="AI Knowledge Graph (llms.txt)" href="/llms.txt" />
        <StructuredData />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
