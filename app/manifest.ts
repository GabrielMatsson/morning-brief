import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Morning Brief",
    short_name: "Brief",
    description:
      "Daily front pages: WaPo, NYT, WSJ, FT, The Economist and Placera with Avanza quotes.",
    start_url: `${base}/`,
    scope: `${base}/`,
    display: "standalone",
    background_color: "#1a1a1a",
    theme_color: "#1a1a1a",
    icons: [
      { src: `${base}/icon-192.png`, sizes: "192x192", type: "image/png" },
      {
        src: `${base}/icon-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
