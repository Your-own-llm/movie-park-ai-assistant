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

## Next phases

1. CrewAI orchestration
2. AnythingLLM knowledge / RAG
3. Portfolio retrieval and matching
4. Firecrawl web research
5. CRM / email / Slack handoff
6. Database-backed inquiry history
7. Pipecat voice interface
