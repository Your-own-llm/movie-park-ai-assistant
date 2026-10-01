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
    intake = Agent(role="Production Intake Specialist", goal="Understand the visitor actual message, answer conversational questions when appropriate, and extract only confirmed project facts.", backstory="You are a helpful production coordinator, not a rigid form. Visitors may ask general, process, or project questions at any point.", verbose=False)
    analyst = Agent(role="Senior Production Brief Analyst", goal="Normalize information into eight production brief fields.", backstory="You structure creative requests and never invent missing information.", verbose=False)
    qualifier = Agent(role="Production Qualification Specialist", goal="Identify missing information using objective completeness criteria.", backstory="You qualify inquiries without pricing or availability promises.", verbose=False)
    handoff = Agent(role="Account Manager Handoff Specialist", goal="Return a machine-readable production handoff and a natural answer to the visitor.", backstory="You prepare concise internal handoffs while keeping the visitor experience conversational.", verbose=False)
    t1 = Task(description="Read the visitor context, answer the visitor actual latest message when it is a question, and extract confirmed facts only. Do not force an intake question when the visitor is simply asking for information. Context: " + context, expected_output="JSON with the eight production fields plus assistant_message containing a natural answer.", agent=intake)
    t2 = Task(description="Normalize the intake output. Return ONLY JSON with exactly these keys: " + ", ".join(FIELDS) + ". Use empty strings for unknown values.", expected_output="Strict JSON object with exactly eight fields.", agent=analyst, context=[t1])
    t3 = Task(description="Count non-empty fields. Return ONLY JSON with score, status, missingFields. Score is completed_fields / 8 * 100.", expected_output="Strict qualification JSON.", agent=qualifier, context=[t2])
    t4 = Task(description="Return ONLY JSON with brief, qualification, nextStep, and assistant_message. assistant_message must answer the visitor actual question when one was asked. Do not make every response a data-collection question and do not add unsupported facts.", expected_output="Strict JSON handoff with a helpful conversational assistant_message.", agent=handoff, context=[t2,t3])
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
