# Agent Architecture

Phase 3 defines the production-agent contract without requiring an API key.

## Pipeline

Visitor message
→ Intake Agent
→ Brief Analyst
→ Qualification Agent
→ Portfolio Matcher
→ Account Manager Handoff

## Agent responsibilities

### Intake Agent
Turns conversational messages into structured fields:
project type, brand, location, deliverables, deadline, budget, references, requirements.

### Brief Analyst
Normalizes the collected fields and produces a concise production brief.

### Qualification Agent
Scores completeness and identifies missing information. It does not make pricing or commercial commitments.

### Portfolio Matcher
Takes a structured brief and returns candidate portfolio items from a future knowledge source.

### Handoff Agent
Creates a clean account-manager payload. Future implementations can send this to CRM, email, Slack, or a database.

## Boundary

These contracts are intentionally provider-neutral. CrewAI, an LLM provider, AnythingLLM, and external integrations can be connected behind these interfaces later.
