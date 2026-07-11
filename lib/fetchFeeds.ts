import Parser from "rss-parser";
import { PAPERS, type PaperConfig, type SectionConfig } from "./feeds";

export interface Article {
  title: string;
  link: string;
  description: string;
  author: string;
  /** ISO timestamp, empty if the feed omitted it */
  pubDate: string;
}

export interface SectionData {
  title: string;
  articles: Article[];
  /** True when every feed for this section failed */
  unavailable: boolean;
}

export interface PaperData {
  config: PaperConfig;
  sections: SectionData[];
}

// WaPo (and others) return 403 to non-browser user agents.
const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

const parser = new Parser({
  timeout: 15000,
  headers: {
    "User-Agent": BROWSER_UA,
    Accept: "application/rss+xml, application/xml, text/xml, */*",
  },
});

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#0?39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchOneFeed(url: string): Promise<Article[]> {
  const feed = await parser.parseURL(url);
  return (feed.items || [])
    .filter((item) => item.title && item.link)
    .map((item) => ({
      title: stripHtml(item.title || ""),
      link: item.link || "",
      description: stripHtml(item.contentSnippet || item.content || "").slice(0, 320),
      author: stripHtml(item.creator || (item as { author?: string }).author || ""),
      pubDate: item.isoDate || "",
    }));
}

interface RawSection {
  config: SectionConfig;
  articles: Article[];
  allFailed: boolean;
}

async function fetchSection(section: SectionConfig): Promise<RawSection> {
  const results = await Promise.allSettled(section.urls.map(fetchOneFeed));
  const excluded = new Set(section.excludeTitles || []);

  const merged: Article[] = [];
  const seen = new Set<string>();
  for (const result of results) {
    if (result.status === "rejected") {
      console.warn(`[feeds] failed: ${section.title}:`, result.reason?.message || result.reason);
      continue;
    }
    for (const article of result.value) {
      if (!seen.has(article.link) && !excluded.has(article.title)) {
        seen.add(article.link);
        merged.push(article);
      }
    }
  }

  // Newest first; items without dates keep feed order at the end.
  merged.sort((a, b) => (b.pubDate || "").localeCompare(a.pubDate || ""));

  return {
    config: section,
    articles: merged,
    allFailed: results.every((r) => r.status === "rejected"),
  };
}

export async function loadAllPapers(): Promise<PaperData[]> {
  return Promise.all(
    PAPERS.map(async (config) => {
      const raw = await Promise.all(config.sections.map(fetchSection));

      // A story shows once per paper: earlier sections (front page first)
      // claim their articles, later sections skip links already shown.
      const shown = new Set<string>();
      const sections: SectionData[] = raw.map((section) => {
        const articles = section.articles
          .filter((a) => !shown.has(a.link))
          .slice(0, section.config.cap);
        for (const a of articles) shown.add(a.link);
        return {
          title: section.config.title,
          articles,
          unavailable: section.allFailed,
        };
      });

      return { config, sections };
    })
  );
}
