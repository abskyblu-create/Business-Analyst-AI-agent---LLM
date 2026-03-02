// app/api/agent/route.ts
import { NextResponse } from "next/server";
import { researchEarnings } from "@/lib/services/research";
import { analyzeEarnings } from "@/lib/services/llm";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const demoEnabled = process.env.DEMO_MODE === "true";
    const required = process.env.DEMO_ACCESS_KEY || "";
    const provided = req.headers.get("x-access-key") || "";

    if (demoEnabled && !required) {
      return NextResponse.json(
        { status: "error", error: "Server misconfigured: missing DEMO_ACCESS_KEY" },
        { status: 500 }
      );
    }

    //  If demoEnabled:
    // - missing/wrong key => DEMO
    // - correct key => REAL
    const isDemo = demoEnabled ? provided !== required : false;

    const company = body.company || "Tesla";
    const query = body.query || `${company} latest quarterly earnings report investor relations`;

    // 1) Research (demo => offline; real => Tavily+Firecrawl)
    const research = await researchEarnings(query, { demo: isDemo });

    const sources =
      (research.allResults || []).slice(0, 3).map((r: any) => ({
        title: r.title,
        url: r.url,
      })) || [{ title: research.source?.title || "Source", url: research.source?.url }];

    const reportText = research.content || "";
    if (!reportText || reportText.trim().length < 50) {
      throw new Error("Research returned empty/too-short content to analyze.");
    }

    // 2) LLM analysis (demo => local mock; real => OpenAI)
    const analysis = await analyzeEarnings({
      company,
      reportText,
      sources,
      demo: isDemo,
    });

    return NextResponse.json({
      status: "analysis_complete",
      mode: isDemo ? "DEMO" : "PRIVATE_REAL",
      demo: isDemo,
      researchMode: isDemo ? "DEMO_RESEARCH" : "LIVE_RESEARCH",
      llmMode: isDemo ? "DEMO_LLM" : "LIVE_LLM",
      debug: research.debug,
      company,
      query,
      sources,
      analysis,
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
