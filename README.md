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
