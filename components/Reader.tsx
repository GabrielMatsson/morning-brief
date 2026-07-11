"use client";

import { useCallback, useEffect, useState } from "react";
import type { PaperData } from "@/lib/fetchFeeds";
import PaperFront from "./PaperFront";

export default function Reader({
  papers,
  generatedAt,
}: {
  papers: PaperData[];
  generatedAt: string;
}) {
  const [active, setActive] = useState(0);
  const [flipDir, setFlipDir] = useState<1 | -1>(1);

  useEffect(() => {
    const fromHash = papers.findIndex(
      (p) => `#${p.config.id}` === window.location.hash
    );
    if (fromHash >= 0) setActive(fromHash);
  }, [papers]);

  const switchTo = useCallback(
    (index: number, dir: 1 | -1) => {
      const next = (index + papers.length) % papers.length;
      setFlipDir(dir);
      setActive(next);
      history.replaceState(null, "", `#${papers[next].config.id}`);
      window.scrollTo({ top: 0 });
    },
    [papers]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") switchTo(active + 1, 1);
      if (e.key === "ArrowLeft") switchTo(active - 1, -1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, switchTo]);

  const paper = papers[active];

  return (
    <div className={`reader paper-${paper.config.id}`}>
      <nav className="tabbar" aria-label="Newspapers in reading order">
        <div className="tabbar-inner">
          {papers.map((p, i) => (
            <button
              key={p.config.id}
              className={`tab ${i === active ? "tab-active" : ""}`}
              onClick={() => switchTo(i, i > active ? 1 : -1)}
              aria-current={i === active ? "page" : undefined}
            >
              <span className="tab-order">{i + 1}</span>
              {p.config.tab}
            </button>
          ))}
          <span className="tab-hint" aria-hidden="true">
            ← → to flip papers
          </span>
        </div>
      </nav>

      <div
        key={paper.config.id}
        className={flipDir === 1 ? "flip-in-right" : "flip-in-left"}
      >
        <PaperFront paper={paper} generatedAt={generatedAt} />
      </div>

      <footer className="site-footer">
        <p>
          Headlines come from each publication&rsquo;s official RSS feeds and link
          to the original articles — your own subscriptions apply. Reading order
          and sections follow Jamie Dimon&rsquo;s morning routine.
        </p>
      </footer>
    </div>
  );
}
