// lib/services/llm.ts
// Intelligence + analysis layer (LLM) with Zod validation
import OpenAI from "openai";
import { z } from "zod";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Strict finance-only schema (runtime-validated)
export const FinanceAnalysisSchema = z.object({
  company: z.string(),
  quarter: z.string().nullable(),
  summary: z.string(),
  keyMetrics: z.array(z.string()).min(3).max(10),
  risks: z.array(z.string()).min(3).max(10),
  opportunities: z.array(z.string()).min(3).max(10),
  metrics: z.object({
    revenue: z.number().nullable(),
    eps: z.number().nullable(),
    grossMarginPct: z.number().nullable(),
    operatingMarginPct: z.number().nullable(),
    freeCashFlow: z.number().nullable(),
    currency: z.string().nullable(),
  }),
  sources: z
    .array(
      z.object({
        title: z.string(),
        url: z.string().url(),
      })
    )
    .min(1),
});

export type FinanceAnalysis = z.infer<typeof FinanceAnalysisSchema>;

/**
 * analyzeEarnings
 * - demo=true => returns safe local mock (0 OpenAI cost)
 * - otherwise => uses OpenAI (if available) OR falls back to env MOCK_LLM
 */
export async function analyzeEarnings(params: {
  company: string;
  reportText: string;
  sources: Array<{ title: string; url: string }>;
  demo?: boolean; //  new: explicit demo flag
}) {
  const isDemo = params.demo === true;

  // Backward-compat: allow env flag too
  const useMockEnv = process.env.MOCK_LLM === "true";
  const useMock = isDemo || useMockEnv;

  //  SAFE MOCK MODE (0 OpenAI usage)
  if (useMock) {
    const mock = {
      company: params.company,
      quarter: isDemo ? "Q4 (Demo)" : "Q4 (Mock)",
      summary:
        "This is a demo/mock earnings summary generated without calling the OpenAI API. It demonstrates the agent pipeline: research  analysis  structured output.",
      keyMetrics: [
        "Revenue: null (demo/mock mode)",
        "EPS: null (demo/mock mode)",
        "Gross margin: null (demo/mock mode)",
        "Free cash flow: null (demo/mock mode)",
      ],
      risks: [
        "Pricing pressure and competitive intensity in the market.",
        "Margin compression due to discounts and input cost volatility.",
        "Regulatory and geopolitical risks affecting supply chain and demand.",
      ],
      opportunities: [
        "Operational efficiency improvements and cost optimization.",
        "Expansion of higher-margin services/recurring revenue streams.",
        "Product innovation and geographic expansion to new markets.",
      ],
      metrics: {
        revenue: null,
        eps: null,
        grossMarginPct: null,
        operatingMarginPct: null,
        freeCashFlow: null,
        currency: "USD",
      },
      sources: (params.sources || []).slice(0, 3),
    };

    return FinanceAnalysisSchema.parse(mock);
  }

  //  REAL MODE (OpenAI required)
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY in .env.local / Vercel env vars");
  }

  const text = params.reportText.slice(0, 8000);
  const sources = params.sources.slice(0, 3);

  const prompt = `
You are a senior financial business analyst.
Analyze the earnings report text and return ONLY valid JSON.

Return JSON with keys EXACTLY:
company, quarter, summary, keyMetrics, risks, opportunities, metrics, sources

Rules:
- summary: 2-3 sentences
- keyMetrics/risks/opportunities: 3-10 bullets each
- metrics: all keys must exist; if unknown set to null
- revenue and freeCashFlow must be numeric (no $ sign, no B/M). If unknown: null
- margins must be numeric percent (e.g., 17.6). If unknown: null
- sources must include the provided sources list (top 3)

Company: ${params.company}
Provided sources: ${JSON.stringify(sources)}

Earnings text:
${text}
`.trim();

  const resp = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [{ role: "user", content: prompt }],
  });

  const raw = resp.choices[0]?.message?.content ?? "{}";

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("LLM returned invalid JSON (cannot parse).");
  }

  return FinanceAnalysisSchema.parse(parsed);
}
