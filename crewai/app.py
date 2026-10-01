import json
from fastapi import FastAPI
from pydantic import BaseModel, Field
from crewai import Agent, Crew, Process, Task

app = FastAPI(title="Movie Park CrewAI Service")
FIELDS = ["client","project","location","deliverables","deadline","budget","references","requirements"]

class PipelineRequest(BaseModel):
    input: dict = Field(default_factory=dict)

def make_crew(payload: dict):
    context = json.dumps(payload, ensure_ascii=False)
    intake = Agent(role="Production Intake Specialist", goal="Extract only confirmed facts from the visitor conversation and current brief.", backstory="You specialize in commercial film production intake.", verbose=False)
    analyst = Agent(role="Senior Production Brief Analyst", goal="Normalize information into eight production brief fields.", backstory="You structure creative requests and never invent missing information.", verbose=False)
    qualifier = Agent(role="Production Qualification Specialist", goal="Identify missing information using objective completeness criteria.", backstory="You qualify inquiries without pricing or availability promises.", verbose=False)
    handoff = Agent(role="Account Manager Handoff Specialist", goal="Return a machine-readable production handoff.", backstory="You prepare concise internal production handoffs.", verbose=False)
    t1 = Task(description="Read this visitor context and extract confirmed facts only. Unknown values remain empty. Context: " + context, expected_output="JSON with the eight production fields.", agent=intake)
    t2 = Task(description="Normalize the intake output. Return ONLY JSON with exactly these keys: " + ", ".join(FIELDS) + ". Use empty strings for unknown values.", expected_output="Strict JSON object with exactly eight fields.", agent=analyst, context=[t1])
    t3 = Task(description="Count non-empty fields. Return ONLY JSON with score, status, missingFields. Score is completed_fields / 8 * 100.", expected_output="Strict qualification JSON.", agent=qualifier, context=[t2])
    t4 = Task(description="Return ONLY JSON with brief, qualification, and nextStep. Do not add facts.", expected_output="Strict JSON handoff.", agent=handoff, context=[t2,t3])
    return Crew(agents=[intake,analyst,qualifier,handoff], tasks=[t1,t2,t3,t4], process=Process.sequential, verbose=False)

def parse_json(value):
    text = str(value).strip()
    if text.startswith("```"):
        lines = text.splitlines()
        text = "\n".join(lines[1:-1]).strip()
    return json.loads(text)

@app.get("/health")
def health(): return {"ok": True, "service": "movie-park-crewai"}

@app.post("/run-production-pipeline")
def run_pipeline(request: PipelineRequest):
    raw = make_crew(request.input).kickoff()
    try:
        result = parse_json(raw)
        return {"provider":"crewai","connected":True,"handoff":result}
    except Exception as error:
        return {"provider":"crewai","connected":True,"error":"Structured CrewAI output could not be parsed","detail":str(error)}
