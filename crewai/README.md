# CrewAI Service

Optional Python orchestration service for the Movie Park production pipeline.

Flow:

Node API → CrewAI → Intake → Brief Analyst → Qualification → Portfolio Matcher → Handoff

Run separately from the dependency-free frontend.

## Environment

Set AGENT_PROVIDER=crewai and CREWAI_SERVICE_URL=http://localhost:8000 in the Node environment.

The CrewAI service requires an LLM provider credential such as OPENAI_API_KEY.

Expected endpoint:

POST /run-production-pipeline

The request body contains an input object with the eight production brief fields. The response should return structured JSON for the account-manager handoff.
