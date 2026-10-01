# Public Research Layer

This module provides an optional Firecrawl boundary for public web research.

## Safety boundary

Research is explicitly restricted to approved public domains. The initial allowlist contains:

- movieparkpro.com
- www.movieparkpro.com

Do not use this module to access private dashboards, authenticated pages, client data, or internal systems.

## Behavior

Without FIRECRAWL_API_KEY:
- The application stays functional.
- The request is not sent anywhere.
- The response explains that Firecrawl is not configured.

With FIRECRAWL_API_KEY:
- Only HTTPS URLs on the allowlist are accepted.
- The page is scraped for main-content markdown.
- The returned result is labeled as public research.

This is deliberately separate from the AnythingLLM knowledge layer. Public research should not automatically become trusted internal knowledge.
