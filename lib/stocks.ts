/**
 * Instruments shown in the Placera page's Marknadsöversikt.
 * orderbookId is Avanza's id — verify by opening the link.
 * Edit freely: add your own holdings here.
 */
export interface StockConfig {
  orderbookId: string;
  /** Display name fallback (Avanza's name wins when the fetch succeeds) */
  name: string;
}

export const STOCKS: StockConfig[] = [
  { orderbookId: "5269", name: "Volvo B" },
  { orderbookId: "5247", name: "Investor B" },
  { orderbookId: "5240", name: "Ericsson B" },
  { orderbookId: "5235", name: "Atlas Copco B" },
  { orderbookId: "5431", name: "AstraZeneca" },
  { orderbookId: "5364", name: "H&M B" },
  { orderbookId: "5361", name: "Avanza Bank Holding" },
];
