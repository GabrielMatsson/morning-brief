import { loadAllPapers } from "@/lib/fetchFeeds";
import Reader from "@/components/Reader";

export default async function Home() {
  const papers = await loadAllPapers();

  const now = new Date();
  const opts: Intl.DateTimeFormatOptions = {
    timeZone: "Europe/Stockholm",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  const generatedAt = {
    en: new Intl.DateTimeFormat("en-GB", opts).format(now),
    sv: new Intl.DateTimeFormat("sv-SE", opts).format(now),
  };

  return <Reader papers={papers} generatedAt={generatedAt} />;
}
