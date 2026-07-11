import type { Article, PaperData, SectionData } from "@/lib/fetchFeeds";

function timeOf(article: Article): string {
  if (!article.pubDate) return "";
  const d = new Date(article.pubDate);
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Stockholm",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function Story({ article, lead = false }: { article: Article; lead?: boolean }) {
  const stamp = timeOf(article);
  return (
    <article className={lead ? "story story-lead" : "story"}>
      <a href={article.link} target="_blank" rel="noopener noreferrer">
        <h3 className="story-headline">{article.title}</h3>
      </a>
      {article.description && <p className="story-desc">{article.description}</p>}
      {(article.author || stamp) && (
        <p className="story-meta">
          {article.author && <span className="story-byline">By {article.author}</span>}
          {article.author && stamp && " · "}
          {stamp}
        </p>
      )}
    </article>
  );
}

function Section({ section, isFront }: { section: SectionData; isFront: boolean }) {
  if (section.unavailable) {
    return (
      <section className="paper-section">
        <h2 className="section-title">{section.title}</h2>
        <p className="section-unavailable">
          This section&rsquo;s feed is unavailable this morning.
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
          <Story article={first} lead />
          {rest.length > 0 && (
            <div className="story-columns">
              {rest.map((a) => (
                <Story key={a.link} article={a} />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="story-columns">
          {section.articles.map((a) => (
            <Story key={a.link} article={a} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function PaperFront({
  paper,
  generatedAt,
}: {
  paper: PaperData;
  generatedAt: string;
}) {
  const { config, sections } = paper;
  return (
    <main className="paper">
      <header className="masthead">
        <h1 className="masthead-name">{config.name}</h1>
        <div className="dateline">
          <span>{generatedAt}</span>
        </div>
        <p className="tagline">&ldquo;{config.tagline}&rdquo;</p>
      </header>
      {sections.map((section, i) => (
        <Section key={section.title} section={section} isFront={i === 0} />
      ))}
    </main>
  );
}
