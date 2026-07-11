# The Morning Brief

A daily front-page brief modeled on Jamie Dimon's morning reading routine:
**The Washington Post → The New York Times → The Wall Street Journal → Financial Times → The Economist**, in that order.

Each paper gets its own page (switch with the masthead tabs or ← → arrow keys), styled after the real thing — the FT on its pink paper, the Economist with its red masthead — and laid out like a front page: lead story on top, then columns, with the sections Dimon reads (front page, business, editorials, global coverage).

Headlines come from each publication's **official RSS feeds** and link to the original articles — your own subscriptions apply for full text.

## How it works

- **Next.js static export** — `npm run build` fetches all feeds fresh at build time and writes a fully static site to `out/`.
- **GitHub Actions** rebuilds and deploys to GitHub Pages every morning at 04:00 UTC (≈ 06:00 Stockholm), plus on every push. Trigger a manual refresh from the Actions tab (*Build & deploy the morning brief → Run workflow*).
- A story appears only once per paper — front-page sections claim articles first, later sections skip duplicates.
- A failed feed shows a small "unavailable this morning" note instead of breaking the build.

## Local development

```bash
npm install
npm run build     # fetches live feeds, exports to out/
npm run preview   # serves out/ locally
```

`npm run dev` also works for UI tweaks.

## Deploying (first time)

1. Create a **public** GitHub repository and push this project to `main`.
2. In the repo: **Settings → Pages → Source → GitHub Actions**.
3. The workflow in `.github/workflows/deploy.yml` does the rest.

## Feed notes (July 2026)

- WaPo feeds return 403 unless a browser-like User-Agent is sent (handled in `lib/fetchFeeds.ts`).
- The old WSJ feeds at `feeds.a.dj.com` froze in Jan 2025 — this project uses the current host, `feeds.content.dowjones.io`.
- All feed URLs live in `lib/feeds.ts`; caps and sections are configured there too.
