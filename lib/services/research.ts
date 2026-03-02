// lib/services/research.ts
import { tavily } from "@tavily/core";
import FirecrawlApp from "@mendable/firecrawl-js";

const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY! });
const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY! });

export type SearchResult = {
  title: string;
  url: string;
  content: string;
};

export async function searchWeb(query: string): Promise<SearchResult[]> {
  const response = await tavilyClient.search(query, {
    search_depth: "advanced",
    max_results: 5,
  });

  return (response.results || []).map((r: any) => ({
    title: r.title,
    url: r.url,
    content: r.content || "",
  }));
}

// Firecrawl v4.x uses scrape()
export async function scrapePage(url: string): Promise<string> {
  const result: any = await (firecrawl as any).scrape(url, { formats: ["markdown"] });
  return result?.markdown || result?.data?.markdown || "";
}

/**
 * DEMO mode = NO Tavily, NO Firecrawl => zero credits
 * REAL mode = Tavily + Firecrawl + fallback to Tavily snippets
 */
export async function researchEarnings(query: string, opts?: { demo?: boolean }) {
  const isDemo = opts?.demo === true;

  //  DEMO MODE (0 credits)
  if (isDemo) {
    const demoSource = {
      title: "Demo Earnings Source (offline)",
      url: "https://example.com/demo-earnings",
    };

    return {
      query,
      source: demoSource,
      content: `
DEMO MODE EARNINGS TEXT
Company: DemoCorp
Quarter: Q4 2025

Highlights:
- Revenue increased year-over-year due to higher unit volume.
- Margins were impacted by pricing pressure and input costs.
- Free cash flow improved due to working capital efficiency.

Key metrics:
- Revenue: (demo) not computed
- EPS: (demo) not computed
- Gross margin: (demo) not computed

Risks:
- Competitive pricing pressure
- Supply chain uncertainty
- Regulatory and geopolitical exposure

Opportunities:
- Cost optimization initiatives
- New product launches
- Expansion into new markets
      `.trim(),
      allResults: [{ ...demoSource, content: "Demo snippet" }],
      debug: "DEMO_RESEARCH_NO_CREDITS",
    };
  }

  //  REAL MODE (credits used)
  const results = await searchWeb(query);
  if (results.length === 0) throw new Error("No search results found.");

  // Basic definition/glossary filter
  const badPatterns = [
    "definition",
    "what is",
    "meaning",
    "glossary",
    "dictionary",
    "investopedia",
  ];

  const cleaned = results.filter((r) => {
    const hay = (r.title + " " + r.url).toLowerCase();
    return !badPatterns.some((p) => hay.includes(p));
  });

  const usable = cleaned.length ? cleaned : results;
  const candidates = usable.slice(0, 3);

  for (const r of candidates) {
    try {
      const md = await scrapePage(r.url);
      if (md && md.trim().length > 300) {
        return {
          query,
          source: { title: r.title, url: r.url },
          content: md.slice(0, 8000),
          allResults: usable,
          debug: "FIRECRAWL_OK",
        };
      }
    } catch {
      // try next candidate
    }
  }

  // fallback to Tavily snippet
  return {
    query,
    source: { title: usable[0].title, url: usable[0].url },
    content: (usable[0].content || "").slice(0, 8000),
    allResults: usable,
    debug: "FIRECRAWL_FAILED_FALLBACK_TO_TAVILY",
  };
}
