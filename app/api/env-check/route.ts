import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    OPENAI: !!process.env.OPENAI_API_KEY,
    TAVILY: !!process.env.TAVILY_API_KEY,
    FIRECRAWL: !!process.env.FIRECRAWL_API_KEY,
    RESEND: !!process.env.RESEND_API_KEY,
  });
}

