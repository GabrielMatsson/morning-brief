import type { Article, PaperData, SectionData } from "@/lib/fetchFeeds";
import type { MarketData, QuoteRow } from "@/lib/avanza";

function timeOf(article: Article, locale: string): string {
  if (!article.pubDate) return "";
  const d = new Date(article.pubDate);
  if (isNaN(d.getTime())) return "";
  // Slug-derived dates (Placera) have no meaningful time of day.
  const dateOnly = article.pubDate.endsWith("T00:00:00.000Z");
  return new Intl.DateTimeFormat(locale, {
    timeZone: "Europe/Stockholm",
    day: "numeric",
    month: "short",
    ...(dateOnly ? {} : { hour: "2-digit" as const, minute: "2-digit" as const }),
  }).format(d);
}

function Story({
  article,
  locale,
  lead = false,
}: {
  article: Article;
  locale: string;
  lead?: boolean;
}) {
  const stamp = timeOf(article, locale);
  const by = locale === "sv-SE" ? "Av" : "By";
  return (
    <article className={lead ? "story story-lead" : "story"}>
      <a href={article.link} target="_blank" rel="noopener noreferrer">
        <h3 className="story-headline">{article.title}</h3>
      </a>
      {article.description && <p className="story-desc">{article.description}</p>}
      {(article.author || stamp) && (
        <p className="story-meta">
          {article.author && (
            <span className="story-byline">
              {by} {article.author}
            </span>
          )}
          {article.author && stamp && " · "}
          {stamp}
        </p>
      )}
    </article>
  );
}

function Section({
  section,
  isFront,
  locale,
}: {
  section: SectionData;
  isFront: boolean;
  locale: string;
}) {
  if (section.unavailable) {
    return (
      <section className="paper-section">
        <h2 className="section-title">{section.title}</h2>
        <p className="section-unavailable">
          {locale === "sv-SE"
            ? "Flödet är inte tillgängligt i morse."
            : "This section’s feed is unavailable this morning."}
        </p>
      </section>
    );
  }
  if (section.articles.length === 0) return null;

  const [first, ...rest] = section.articles;

  return (
    <section className="paper-section">
      <h2 className="section-title">{section.title}</h2>
      {isFront ? (
        <>
          <Story article={first} locale={locale} lead />
          {rest.length > 0 && (
            <div className="story-columns">
              {rest.map((a) => (
                <Story key={a.link} article={a} locale={locale} />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="story-columns">
          {section.articles.map((a) => (
            <Story key={a.link} article={a} locale={locale} />
          ))}
        </div>
      )}
    </section>
  );
}

/* ------------------------- Marknadsöversikt ------------------------- */

const svNumber = new Intl.NumberFormat("sv-SE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const w = 96;
  const h = 26;
  const pad = 2;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values
    .map((v, i) => {
      const x = pad + (i / (values.length - 1)) * (w - 2 * pad);
      const y = h - pad - ((v - min) / span) * (h - 2 * pad);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MarketRow({ row }: { row: QuoteRow }) {
  const up = row.changePercent >= 0;
  // The explicit sign carries direction; color only reinforces it.
  const change = `${up ? "+" : "−"}${svNumber.format(Math.abs(row.changePercent))} %`;
  return (
    <a
      className={`market-row ${up ? "market-up" : "market-down"}`}
      href={row.link}
      target="_blank"
      rel="noopener noreferrer"
      title={`${row.name} — senaste månaden`}
    >
      <span className="market-name">{row.name}</span>
      <Sparkline values={row.spark} />
      <span className="market-last">
        {svNumber.format(row.last)}
        {row.currency && <span className="market-currency"> {row.currency}</span>}
      </span>
      <span className="market-change">{change}</span>
    </a>
  );
}

function MarketPanel({ market }: { market: MarketData }) {
  if (market.rows.length === 0) return null;
  return (
    <section className="paper-section market-panel">
      <h2 className="section-title">Marknadsöversikt</h2>
      <div className="market-grid">
        {market.rows.map((row) => (
          <MarketRow key={row.link} row={row} />
        ))}
      </div>
      <p className="market-note">
        Kurser från Avanza (index via Yahoo) — ögonblicksbild från när sidan
        byggdes. Utveckling: senaste handelsdagen; kurvan visar en månad.
      </p>
    </section>
  );
}

/* ----------------------------- Paper page ---------------------------- */

export default function PaperFront({
  paper,
  generatedAt,
}: {
  paper: PaperData;
  generatedAt: { en: string; sv: string };
}) {
  const { config, sections, market } = paper;
  const locale = config.lang === "sv" ? "sv-SE" : "en-GB";
  const dateline = config.lang === "sv" ? generatedAt.sv : generatedAt.en;
  return (
    <main className="paper">
      <header className="masthead">
        <h1 className="masthead-name">{config.name}</h1>
        <div className="dateline">
          <span>{dateline}</span>
        </div>
        <p className="tagline">&ldquo;{config.tagline}&rdquo;</p>
      </header>
      {market && <MarketPanel market={market} />}
      {sections.map((section, i) => (
        <Section
          key={section.title}
          section={section}
          isFront={i === 0}
          locale={locale}
        />
      ))}
    </main>
  );
}
