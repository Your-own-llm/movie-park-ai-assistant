# Movie Park Portfolio Knowledge

This folder is the source-of-truth format for portfolio retrieval.

Each project should eventually contain:
- title
- client/brand
- category
- services
- location
- year
- formats/deliverables
- creative keywords
- short description
- source URL

The demo uses these records only as structured knowledge. Do not present them as live internal data until Movie Park provides or approves the source material.

## Retrieval flow

Visitor request
→ Portfolio Matcher
→ knowledge records / AnythingLLM
→ relevant projects
→ concise project recommendations

AnythingLLM can later ingest an exported corpus from this folder or a prepared knowledge-base document.
