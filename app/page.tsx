"use client";

import { useState } from "react";


type Source = { title: string; url: string };

type FinanceAnalysis = {
  company: string;
  quarter: string | null;
  summary: string;
  keyMetrics: string[];
  risks: string[];
  opportunities: string[];
  metrics: {
    revenue: number | null;
    eps: number | null;
    grossMarginPct: number | null;
    operatingMarginPct: number | null;
    freeCashFlow: number | null;
    currency: string | null;
  };
  sources: Source[];
};

type AgentResponse =
  | {
      status: "analysis_complete";
      company: string;
      query: string;
      sources: Source[];
      analysis: FinanceAnalysis;
    }
  | { status: "error"; error: string };

const TASKS = [
  {
    label: "Earnings Summary",
    queryTemplate: (c: string) => `${c} latest quarterly earnings summary investor relations`,
  },
  {
    label: "Risks & Opportunities",
    queryTemplate: (c: string) => `${c} latest earnings report risks opportunities investor relations`,
  },
  {
    label: "Key Metrics",
    queryTemplate: (c: string) => `${c} latest earnings revenue EPS margin free cash flow investor relations`,
  },
  {
    label: "Official Earnings Deck (best source)",
    queryTemplate: (c: string) => `${c} quarterly update deck earnings PDF investor relations`,
  },
];

export default function Page() {
  const [company, setCompany] = useState("Tesla");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [accessKey, setAccessKey] = useState("");
  const [agentStatus, setAgentStatus] = useState<
    "idle" | "searching" | "scraping" | "analyzing" | "done" | "error"
  >("idle");
  const [data, setData] = useState<AgentResponse | null>(null);
  

  async function runAgent(finalQuery: string) {
    setLoading(true);
    setData(null);

    // Agent feel status changes
    setAgentStatus("searching");
    await new Promise((r) => setTimeout(r, 350));
    setAgentStatus("scraping");
    await new Promise((r) => setTimeout(r, 350));
    setAgentStatus("analyzing");

    const payload = { company, query: finalQuery };

    const headers: Record<string, string> = {
       "Content-Type": "application/json",
  };

    if (accessKey.trim()) {
       headers["x-access-key"] = accessKey.trim();
  }
 
    const res = await fetch("/api/agent", {
       method: "POST",
       headers,
       body: JSON.stringify(payload), 
  });
    const json = (await res.json()) as AgentResponse;
    setData(json);

    if (json.status === "error") setAgentStatus("error");
    else setAgentStatus("done");

    setLoading(false);
  }

  function runFromInput() {
    const finalQuery = query.trim()
      ? query
      : `${company} latest quarterly earnings report investor relations`;
    runAgent(finalQuery);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Business Analyst AI Agent</h1>
        <p className="text-gray-600 mb-6">
          A financial research agent that searches  scrapes  analyzes earnings and produces a
          structured memo with sources.
        </p>


    <div className="text-sm text-gray-600 mb-6">
        Created by{" "}
        <span className="font-semibold">Ankit Bhatt</span>{" "}
        {" "}
        <a
          href="https://www.linkedin.com/in/ankit-bhatt-4a1631388/"
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 underline"
        >
         LinkedIn
       </a>
    </div>


        {/* Input Card */}
        <div className="bg-white rounded-xl shadow p-5 mb-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Company</label>
              <input
                className="w-full border rounded-lg p-3"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Tesla"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Custom Query (optional)</label>
              <input
                className="w-full border rounded-lg p-3"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., Tesla Q4 earnings report"
              />
            </div>
          </div>

          <div className="mt-4">
             <label className="block text-sm font-medium mb-1">
             Access Key (optional  private mode only)
             </label>
             <input
               className="w-full border rounded-lg p-3"
               value={accessKey}
               onChange={(e) => setAccessKey(e.target.value)}
               placeholder="Paste private access key here"
          />
           <div className="text-xs text-gray-500 mt-1">
               Public users leave this empty (demo mode).
           </div>
          </div>




         {/* Task Buttons */}
          <div className="mt-4">
            <div className="text-sm font-semibold mb-2">Agent Tasks (click one)</div>
            <div className="flex flex-wrap gap-2">
              {TASKS.map((t) => (
                <button
                  key={t.label}
                  onClick={() => runAgent(t.queryTemplate(company))}
                  disabled={loading || !company.trim()}
                  className="px-3 py-2 rounded-lg border bg-gray-50 hover:bg-gray-100 text-sm disabled:opacity-50"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={runFromInput}
            disabled={loading || !company.trim()}
            className="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? "Agent running..." : "Run Agent (Custom)"}
          </button>

          {/* Status */}
          <div className="mt-4 text-sm">
            <span className="text-gray-500">Agent status:</span>{" "}
            <span className="font-semibold">
              {agentStatus === "idle" && "Idle"}
              {agentStatus === "searching" && "Searching web"}
              {agentStatus === "scraping" && "Scraping sources"}
              {agentStatus === "analyzing" && "Analyzing report"}
              {agentStatus === "done" && "Done"}
              {agentStatus === "error" && "Error"}
            </span>
          </div>

          {/* Help Box */}
          <div className="mt-4 p-4 rounded-lg bg-gray-50 border text-sm">
            <div className="font-semibold mb-2">Supported (best-performing) requests</div>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>{company} latest quarterly earnings summary</li>
              <li>{company} Q4 earnings update deck / investor relations</li>
              <li>{company} revenue, EPS, margin, free cash flow last quarter</li>
              <li>Top risks and opportunities mentioned in {company} earnings</li>
            </ul>
            <div className="mt-2 text-gray-500">
              Note: Ratio calculations (debt ratio, D/E) need a separate calculator layer.
              This agent focuses on earnings research + extraction.
            </div>
          </div>
        </div>

        {/* Results */}
        {data?.status === "error" && (
          <div className="bg-white rounded-xl shadow p-5 border border-red-200">
            <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
            <p className="text-gray-800">{data.error}</p>
          </div>
        )}

        {data?.status === "analysis_complete" && (
          <div className="bg-white rounded-xl shadow p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <div>
                <h2 className="text-2xl font-bold">
                  {data.analysis.company}  {data.analysis.quarter ?? "Quarter N/A"}
                </h2>
                <p className="text-gray-600 text-sm break-words">Query: {data.query}</p>
              </div>
              <div className="text-sm text-gray-600">
                Currency:{" "}
                <span className="font-semibold">
                  {data.analysis.metrics.currency ?? "N/A"}
                </span>
                <div className="text-xs text-gray-500">(MOCK_LLM may show null numbers)</div>
              </div>
            </div>

            <div className="mb-5">
              <h3 className="text-lg font-bold mb-2">Summary</h3>
              <p className="text-gray-800">{data.analysis.summary}</p>
            </div>

            <div className="mb-5">
              <h3 className="text-lg font-bold mb-2">Key Metrics</h3>
              <ul className="list-disc pl-5 text-gray-800">
                {data.analysis.keyMetrics.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>

            <div className="grid gap-6 md:grid-cols-2 mb-6">
              <div>
                <h3 className="text-lg font-bold mb-2">Risks</h3>
                <ul className="list-disc pl-5 text-gray-800">
                  {data.analysis.risks.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">Opportunities</h3>
                <ul className="list-disc pl-5 text-gray-800">
                  {data.analysis.opportunities.map((o, i) => (
                    <li key={i}>{o}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-bold mb-2">Sources</h3>
              <ul className="list-disc pl-5">
                {data.analysis.sources.map((s, i) => (
                  <li key={i}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline break-words"
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
