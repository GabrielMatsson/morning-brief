import type { Metadata } from "next";
import { Playfair_Display, UnifrakturMaguntia } from "next/font/google";
import "./globals.css";

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
    "A daily front-page brief modeled on Jamie Dimon's morning reading: The Washington Post, The New York Times, The Wall Street Journal, the Financial Times and The Economist.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${blackletter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
