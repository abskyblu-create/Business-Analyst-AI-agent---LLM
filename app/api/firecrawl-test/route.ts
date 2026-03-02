import { NextResponse } from "next/server";
import { scrapePage } from "@/lib/services/research";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url") || "https://www.tesla.com/ir";

  try {
    const md = await scrapePage(url);
    return NextResponse.json({
      url,
      length: md.length,
      preview: md.slice(0, 400),
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Firecrawl failed" },
      { status: 500 }
    );
  }
}
