# Movie Park AI Production Assistant

Concept demo for an AI-assisted production inquiry workflow.

## Demo flow

Landing → AI Assistant → Project Brief → Portfolio Matching → Account Manager Dashboard → Inquiry Details

## Phase 1 — Experience

- Premium cinematic landing page
- Conversational project intake
- Structured project brief
- Portfolio matching concept
- Account manager inquiry workspace
- Responsive layout
- No dependencies or external API calls

## Phase 2 — Inquiry Intelligence

The Phase 2 module adds a lightweight, transparent qualification layer without pretending to be a live Movie Park system.

### Qualification inputs

- Client / brand
- Project type
- Location
- Deliverables
- Timeline / deadline
- Budget
- References / creative direction
- Additional requirements

### Qualification output

Each inquiry receives:

- Completeness score out of 100
- **QUALIFIED**
- **REVIEW REQUIRED**
- **NEEDS DETAILS**

The account-manager dashboard is updated from the same inquiry state. Demo actions can assign an inquiry to an account manager and mark it as contacted.

### Persistence

Demo inquiry state is saved in the visitor's browser using localStorage. No client data is sent to an external service.

## Important demo boundary

This is a concept demonstration. It is not connected to Movie Park's internal CRM, email, Instagram, WhatsApp, portfolio database, or production systems.

## Phase 3 — Agent Architecture

The repository now contains provider-neutral contracts for an Intake Agent, Brief Analyst, Qualification Agent, Portfolio Matcher, and Account Manager Handoff. The contracts normalize the same eight production fields used by the frontend and return a predictable `production_inquiry` payload.

A dependency-free Node test suite covers normalization, qualification, missing fields, and handoff behavior. No API key or external service is required.

## Next phases

1. Connect the agent contract to CrewAI + an LLM provider
2. Connect AnythingLLM for production knowledge / RAG
3. Add a real portfolio retrieval index
4. Add Firecrawl research tools with explicit source boundaries
5. Add CRM / email / Slack handoff
6. Replace localStorage with database-backed inquiry history
7. Add Pipecat voice interface


## Phase 5 — Public Research / Firecrawl

An optional Firecrawl research layer is available under `server/research/`. It is deliberately restricted to approved public HTTPS domains and currently allowlists Movie Park's public domain only. It does not access authenticated pages or internal systems.

Public research is kept separate from the AnythingLLM knowledge layer. Scraped information should be reviewed before being treated as trusted portfolio knowledge.

Environment:
- `FIRECRAWL_API_KEY`
- optional `FIRECRAWL_URL`

Without a Firecrawl key, the application remains functional and makes no external research request.


## Phase 6 — Account Manager Handoff

The API can now turn a production inquiry into a structured account-manager handoff. Optional notification adapters are available for a generic webhook and Slack incoming webhook.

Environment:
- `HANDOFF_WEBHOOK_URL` — optional generic webhook
- `SLACK_WEBHOOK_URL` — optional Slack incoming webhook

If neither is configured, the handoff is generated locally and no external notification is sent.

The demo does not claim a real CRM record exists. A CRM adapter can be added later behind the same handoff contract.


## Phase 7 — Persistent Admin Inquiry State

Production inquiries are now persisted through a backend repository and exposed to the admin layer for listing, detail retrieval, assignment, and contacted status.

The current implementation uses a JSON file repository for zero-dependency persistence. The same repository contract can later be backed by SQLite, Postgres, or Supabase.

Admin operations are intentionally not authenticated yet. Production deployment must add authenticated admin access before exposing these endpoints publicly.


## Phase 8 — Protected Admin Dashboard

The demo now includes a dependency-free HTTP server and authenticated admin workspace.

- `npm start` starts the API and serves the frontend.
- `POST /api/admin/login` creates an admin session.
- `GET /api/admin/inquiries` requires a bearer session token.
- `GET/PATCH /api/admin/inquiries/:id` requires authentication.
- `POST /api/inquiries` persists generated production inquiries.
- The frontend Admin route shows a login screen when unauthenticated.
- Assignment and Contacted actions use the protected backend API.

Configure `ADMIN_USERNAME` and `ADMIN_PASSWORD` before deployment. The current session implementation is process-local and should be replaced with production-grade expiring secure sessions or managed identity before handling real client data.
