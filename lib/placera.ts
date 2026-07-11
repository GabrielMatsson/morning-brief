import type { Article } from "./fetchFeeds";

/**
 * Placera has no RSS anymore — but every page is server-rendered, so the
 * article cards (link + title + preamble) can be read straight out of the HTML.
 */

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

const ARTICLE_LINK =
  /<a[^>]+href="(\/(?:nyheter|analys|telegram)\/[^"#?]+)"[^>]*>([\s\S]*?)<\/a>/g;

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#0?39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, " ")
    .trim();
}

function textOf(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, " "));
}

/** Slugs end in -YYYY-MM-DD; use it as the publication date. */
function dateFromSlug(path: string): string {
  const m = path.match(/(\d{4}-\d{2}-\d{2})$/);
  return m ? `${m[1]}T00:00:00.000Z` : "";
}

export async function fetchPlaceraPage(url: string): Promise<Article[]> {
  const res = await fetch(url, {
    headers: { "User-Agent": BROWSER_UA, Accept: "text/html" },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`${res.status} for ${url}`);
  const html = await res.text();

  const articles: Article[] = [];
  const seen = new Set<string>();

  for (const m of html.matchAll(ARTICLE_LINK)) {
    const path = m[1];
    if (seen.has(path)) continue;

    const inner = m[2];
    // The card's heading tag is the title; the rest of the text is the preamble.
    const heading = inner.match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/);
    const title = textOf(heading ? heading[1] : inner);
    if (!title || title.length < 8) continue;

    let description = "";
    if (heading) {
      const afterHeading = inner.slice((heading.index ?? 0) + heading[0].length);
      description = textOf(afterHeading);
      // Category chips etc. produce tiny fragments — not a real preamble.
      if (description.length < 30) description = "";
    }

    seen.add(path);
    articles.push({
      title,
      link: `https://www.placera.se${path}`,
      description: description.slice(0, 320),
      author: "",
      pubDate: dateFromSlug(path),
    });
  }

  return articles;
}
