import { STOCKS } from "./stocks";

export interface QuoteRow {
  name: string;
  /** Last traded price / index level */
  last: number;
  /** Day change in percent (signed) */
  changePercent: number;
  currency: string;
  /** ~1 month of closes for the sparkline (oldest → newest) */
  spark: number[];
  link: string;
}

export interface MarketData {
  rows: QuoteRow[];
}

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

async function getJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: { "User-Agent": BROWSER_UA, Accept: "application/json" },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`${res.status} for ${url}`);
  return res.json();
}

function downsample(values: number[], max = 30): number[] {
  if (values.length <= max) return values;
  const step = (values.length - 1) / (max - 1);
  return Array.from({ length: max }, (_, i) => values[Math.round(i * step)]);
}

async function fetchStock(orderbookId: string, fallbackName: string): Promise<QuoteRow> {
  const guide = (await getJson(
    `https://www.avanza.se/_api/market-guide/stock/${orderbookId}`
  )) as {
    name?: string;
    listing?: { currency?: string };
    quote?: { last?: number; changePercent?: number };
  };

  let spark: number[] = [];
  try {
    const chart = (await getJson(
      `https://www.avanza.se/_api/price-chart/stock/${orderbookId}?timePeriod=one_month`
    )) as { ohlc?: { close: number }[] };
    spark = downsample((chart.ohlc || []).map((c) => c.close).filter(Number.isFinite));
  } catch {
    // Sparkline is decoration — the quote row still works without it.
  }

  const last = guide.quote?.last;
  const changePercent = guide.quote?.changePercent;
  if (typeof last !== "number" || typeof changePercent !== "number") {
    throw new Error(`no quote for ${orderbookId}`);
  }

  return {
    name: guide.name || fallbackName,
    last,
    changePercent,
    currency: guide.listing?.currency || "SEK",
    spark,
    link: `https://www.avanza.se/aktier/om-aktien.html/${orderbookId}`,
  };
}

/** OMXS30 — Avanza has no public index endpoint, Yahoo's chart API does. */
async function fetchOmxs30(): Promise<QuoteRow> {
  const data = (await getJson(
    "https://query1.finance.yahoo.com/v8/finance/chart/%5EOMX?range=1mo&interval=1d"
  )) as {
    chart: { result: { indicators: { quote: { close: (number | null)[] }[] } }[] };
  };
  const closes = (data.chart.result[0]?.indicators.quote[0]?.close || []).filter(
    (c): c is number => typeof c === "number" && Number.isFinite(c)
  );
  if (closes.length < 2) throw new Error("no OMXS30 series");

  const last = closes[closes.length - 1];
  const prev = closes[closes.length - 2];
  return {
    name: "OMXS30",
    last,
    changePercent: (last / prev - 1) * 100,
    currency: "",
    spark: downsample(closes),
    link: "https://www.avanza.se/index/om-indexet.html/19002/omx-stockholm-30",
  };
}

export async function loadMarketData(): Promise<MarketData> {
  const results = await Promise.allSettled([
    fetchOmxs30(),
    ...STOCKS.map((s) => fetchStock(s.orderbookId, s.name)),
  ]);

  const rows: QuoteRow[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") rows.push(r.value);
    else console.warn("[market] failed:", r.reason?.message || r.reason);
  }
  return { rows };
}
