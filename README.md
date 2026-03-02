*Business Analyst GenAI Agent*

# Live Application:
 https://business-analyst-ai-agent-llm.vercel.app

# Created by:
Ankit Bhatt
🔗 LinkedIn: https://www.linkedin.com/in/ankit-bhatt-4a1631388/
________________________________________
# Overview
Business Analyst AI Agent is a production-ready autonomous financial research system that:
•	Searches earnings reports
•	Scrapes structured financial content
•	Extracts key metrics
•	Analyzes risks and opportunities
•	Produces structured financial intelligence
•	Supports demo and private execution modes
•	Runs serverlessly on Vercel
________________________________________
# Architecture
User → Next.js UI → API Route (Orchestrator)
→ Tavily (Web Search)
→ Firecrawl (Scraping)
→ OpenAI (Reasoning)
→ Zod (Validation)
→ Structured Financial Output
________________________________________
# Key Features
•	Serverless deployment
•	API credit protection via execution gating
•	Structured JSON validation with Zod
•	Public demo mode
•	Private unlock mode
•	Secure environment variable management
•	Production-grade deployment
________________________________________
# Tech Stack

Frontend:
•	Next.js (App Router)
•	React
•	Tailwind CSS

Backend:
•	Next.js API Routes (Serverless)
•	Tavily API
•	Firecrawl
•	OpenAI
•	Zod

Deployment:
•	Vercel
________________________________________
# Demo Mode vs Private Mode

Public Mode:
•	Uses mock data
•	No API credits consumed

Private Mode:
•	Activated via access key (ON REQUEST)
•	Enables real Tavily, Firecrawl, OpenAI
________________________________________
# Environment Variables Required

TAVILY_API_KEY
FIRECRAWL_API_KEY
OPENAI_API_KEY
DEMO_MODE
MOCK_MODE
MOCK_LLM
DEMO_ACCESS_KEY
________________________________________
# Installation (Local Development)

git clone <repo>
cd business-analyst-ai-agent-llm
npm install
npm run dev
________________________________________
# Deployment

Deployed via:
npx vercel --prod
________________________________________

