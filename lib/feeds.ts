export interface SectionConfig {
  /** Section break header, e.g. "FRONT PAGE" */
  title: string;
  /** One or more RSS feed URLs merged into this section */
  urls: string[];
  /** Max items to show */
  cap: number;
  /** Exact titles to drop (e.g. bare digest stubs in Economist feeds) */
  excludeTitles?: string[];
}

export interface PaperConfig {
  id: "wapo" | "nyt" | "wsj" | "ft" | "economist" | "placera";
  name: string;
  /** Short label for the masthead tab bar */
  tab: string;
  /** How this paper is read — shown under the masthead */
  tagline: string;
  /** "rss" (default) or "placera" (scraped SSR pages + market data) */
  kind?: "rss" | "placera";
  /** UI language for dates and small strings; default English */
  lang?: "en" | "sv";
  sections: SectionConfig[];
}

/**
 * Papers in Jamie Dimon's reading order. Feed URLs verified live 2026-07-12.
 * WaPo feeds 403 without a browser-like User-Agent (set in fetchFeeds.ts).
 */
export const PAPERS: PaperConfig[] = [
  {
    id: "wapo",
    name: "The Washington Post",
    tab: "The Post",
    tagline:
      "Skims the front page, reads the stories that interest him, then the business section — and the editorials, because he finds them insightful.",
    sections: [
      {
        title: "Front Page",
        urls: [
          "https://feeds.washingtonpost.com/rss/politics",
          "https://feeds.washingtonpost.com/rss/national",
        ],
        cap: 12,
      },
      {
        title: "Business",
        urls: ["https://feeds.washingtonpost.com/rss/business"],
        cap: 8,
      },
      {
        title: "Opinions & Editorials",
        urls: ["https://feeds.washingtonpost.com/rss/opinions"],
        cap: 8,
      },
    ],
  },
  {
    id: "nyt",
    name: "The New York Times",
    tab: "The Times",
    tagline:
      "Reads the entire front section from beginning to end — even when he disagrees with it. Skims Business, though he doesn't think it's very good.",
    sections: [
      {
        title: "Front Page",
        urls: ["https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml"],
        cap: 15,
      },
      {
        title: "World",
        urls: ["https://rss.nytimes.com/services/xml/rss/nyt/World.xml"],
        cap: 8,
      },
      {
        title: "Business",
        urls: ["https://rss.nytimes.com/services/xml/rss/nyt/Business.xml"],
        cap: 8,
      },
    ],
  },
  {
    id: "wsj",
    name: "The Wall Street Journal",
    tab: "The Journal",
    tagline:
      "Reads the front section, then the Exchange — the business and markets pages.",
    sections: [
      // Note: the old feeds.a.dj.com URLs froze in Jan 2025 — Dow Jones moved
      // the public feeds to feeds.content.dowjones.io.
      {
        title: "Front Section",
        urls: ["https://feeds.content.dowjones.io/public/rss/RSSWorldNews"],
        cap: 12,
      },
      {
        title: "Business",
        urls: ["https://feeds.content.dowjones.io/public/rss/WSJcomUSBusiness"],
        cap: 8,
      },
      {
        title: "Markets",
        urls: ["https://feeds.content.dowjones.io/public/rss/RSSMarketsMain"],
        cap: 8,
      },
      {
        title: "Opinion",
        urls: ["https://feeds.content.dowjones.io/public/rss/RSSOpinion"],
        cap: 6,
      },
    ],
  },
  {
    id: "ft",
    name: "Financial Times",
    tab: "FT",
    tagline:
      "Reads it last — it brings the global perspective the U.S. papers lack, and his business runs in about 100 countries.",
    sections: [
      {
        title: "International Front Page",
        urls: ["https://www.ft.com/rss/home"],
        cap: 12,
      },
      {
        title: "World",
        urls: ["https://www.ft.com/world?format=rss"],
        cap: 8,
      },
      {
        title: "Companies & Markets",
        urls: [
          "https://www.ft.com/companies?format=rss",
          "https://www.ft.com/markets?format=rss",
        ],
        cap: 10,
      },
      {
        title: "Opinion",
        urls: ["https://www.ft.com/opinion?format=rss"],
        cap: 6,
      },
    ],
  },
  {
    id: "economist",
    name: "The Economist",
    tab: "The Economist",
    tagline:
      "For international events — Pakistan, India, the UK, the Middle East, China. Excellent global coverage, like the FT.",
    sections: [
      {
        title: "The World This Week",
        urls: ["https://www.economist.com/the-world-this-week/rss.xml"],
        cap: 6,
        excludeTitles: ["Politics", "Business"],
      },
      {
        title: "Leaders",
        urls: ["https://www.economist.com/leaders/rss.xml"],
        cap: 8,
      },
      {
        title: "International & China",
        urls: [
          "https://www.economist.com/international/rss.xml",
          "https://www.economist.com/china/rss.xml",
        ],
        cap: 10,
      },
      {
        title: "Business, Finance & Economics",
        urls: [
          "https://www.economist.com/business/rss.xml",
          "https://www.economist.com/finance-and-economics/rss.xml",
        ],
        cap: 10,
      },
    ],
  },
  {
    id: "placera",
    kind: "placera",
    lang: "sv",
    name: "Placera",
    tab: "Placera",
    tagline:
      "Min egen sida — svenska marknadsnyheter från Avanzas Placera, med kurser som ögonblicksbild från morgonens bygge.",
    // Placera has no RSS; these URLs are SSR pages parsed by lib/placera.ts.
    sections: [
      { title: "Förstasidan", urls: ["https://www.placera.se/"], cap: 12 },
      { title: "Telegram", urls: ["https://www.placera.se/telegram"], cap: 10 },
      { title: "Analys", urls: ["https://www.placera.se/analys"], cap: 8 },
    ],
  },
];
