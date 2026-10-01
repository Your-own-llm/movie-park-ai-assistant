import os
from fastapi import FastAPI
from pydantic import BaseModel, Field
from crewai import Agent, Crew, Process, Task

app = FastAPI(title="Movie Park CrewAI Service")

class Brief(BaseModel):
    client: str = ""
    project: str = ""
    location: str = ""
    deliverables: str = ""
    deadline: str = ""
    budget: str = ""
    references: str = ""
    requirements: str = ""

class PipelineRequest(BaseModel):
    input: Brief = Field(default_factory=Brief)

def make_crew(brief: Brief):
    context = brief.model_dump_json()

    intake = Agent(
        role="Production Intake Specialist",
        goal="Extract factual production requirements without inventing missing data.",
        backstory="You understand commercial film, branded content, live action, CGI, VFX and social production workflows.",
        verbose=False
    )
    analyst = Agent(
        role="Senior Production Brief Analyst",
        goal="Turn the inquiry into a concise production-ready brief.",
        backstory="You structure creative requests for account managers.",
        verbose=False
    )
    qualifier = Agent(
        role="Production Qualification Specialist",
        goal="Identify missing information and assess inquiry completeness without commercial commitments.",
        backstory="You use objective completeness criteria.",
        verbose=False
    )
    handoff = Agent(
        role="Account Manager Handoff Specialist",
        goal="Prepare a clean internal handoff using only established information.",
        backstory="You create concise production summaries and next steps.",
        verbose=False
    )

    t1 = Task(
        description=f"Extract confirmed production facts and missing fields from: {context}",
        expected_output="Confirmed production requirements and missing fields.",
        agent=intake
    )
    t2 = Task(
        description="Create a concise production brief. Preserve unknown values as unknown.",
        expected_output="Structured production brief.",
        agent=analyst, context=[t1]
    )
    t3 = Task(
        description="Assess completeness. Return QUALIFIED, REVIEW REQUIRED, or NEEDS DETAILS and identify missing information. Do not estimate price or promise availability.",
        expected_output="Qualification status, completeness score and missing fields.",
        agent=qualifier, context=[t2]
    )
    t4 = Task(
        description="Create a JSON-friendly account-manager handoff with brief, qualification and next step.",
        expected_output="Structured account-manager handoff.",
        agent=handoff, context=[t2, t3]
    )

    return Crew(
        agents=[intake, analyst, qualifier, handoff],
        tasks=[t1, t2, t3, t4],
        process=Process.sequential,
        verbose=False
    )

@app.get("/health")
def health():
    return {"ok": True, "service": "movie-park-crewai"}

@app.post("/run-production-pipeline")
def run_pipeline(request: PipelineRequest):
    result = make_crew(request.input).kickoff()
    return {"provider": "crewai", "raw_output": str(result)}
