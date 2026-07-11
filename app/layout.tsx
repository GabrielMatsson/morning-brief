import type { Metadata, Viewport } from "next";
import { Playfair_Display, UnifrakturMaguntia } from "next/font/google";
import RegisterSW from "@/components/RegisterSW";
import "./globals.css";

const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
});

const blackletter = UnifrakturMaguntia({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-blackletter",
});

export const metadata: Metadata = {
  title: "The Morning Brief",
  description:
    "A daily front-page brief modeled on Jamie Dimon's morning reading: The Washington Post, The New York Times, The Wall Street Journal, the Financial Times and The Economist — plus Placera with Avanza quotes.",
  icons: {
    icon: [{ url: `${base}/icon-192.png`, sizes: "192x192", type: "image/png" }],
    apple: [{ url: `${base}/apple-touch-icon.png`, sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Brief",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1a1a1a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${blackletter.variable}`}>
      <body>
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
