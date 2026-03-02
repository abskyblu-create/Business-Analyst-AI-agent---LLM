// app/api/research-test/route.ts
import { NextResponse } from "next/server";
import { researchEarnings } from "@/lib/services/research";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q =
    searchParams.get("q") || "Tesla latest quarterly earnings report";

  // basic env checks (beginner-friendly)
  if (!process.env.TAVILY_API_KEY) {
    return NextResponse.json(
      { error: "Missing TAVILY_API_KEY in .env.local" },
      { status: 500 }
    );
  }
  if (!process.env.FIRECRAWL_API_KEY) {
    return NextResponse.json(
      { error: "Missing FIRECRAWL_API_KEY in .env.local" },
      { status: 500 }
    );
  }

  try {
   console.log("TAVILY_API_KEY exists?", !!process.env.TAVILY_API_KEY);
   console.log("FIRECRAWL_API_KEY exists?", !!process.env.FIRECRAWL_API_KEY);

    const data = await researchEarnings(q);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
