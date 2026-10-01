const API_URL='https://api.openai.com/v1/responses';

function extractText(data){
  if(data.output_text) return data.output_text;
  const parts=[];
  for(const item of data.output||[]){ for(const content of item.content||[]){ if(content.type==='output_text' && content.text) parts.push(content.text); } }
  return parts.join('\n');
}

export async function runOpenAI(input){
  if(!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not configured');
  const model=process.env.OPENAI_MODEL || 'gpt-5.6-luna';
  const instructions=[
    'You are the Movie Park AI Production Assistant. You are genuinely conversational, not a rigid form or scripted questionnaire.',
    'Answer the visitor actual question first. They may ask any reasonable question about film/video production, services, production process, deliverables, locations, timelines, creative approach, portfolio, or working with the studio.',
    'Quietly extract confirmed project information into: client, project, location, deliverables, deadline, budget, references, requirements.',
    'Never invent missing facts. Preserve confirmed information from currentBrief and conversation.',
    'If the visitor asks a general question, answer naturally and do not force an intake question.',
    'If the visitor asks a project question and enough context exists, answer it and optionally ask one relevant follow-up.',
    'Free-form answers are always valid. Any UI suggestions are optional only.',
    'Do not quote prices, promise availability, or claim access to private Movie Park systems.',
    'Use publicResearch when supplied for Movie Park-specific factual answers. Without it, avoid pretending to know unverified studio details.',
    'Use only approved portfolio records when supplied; never present placeholder concepts as real client work.',
    'assistant_message must be natural and helpful. It can answer, explain, clarify, or ask a follow-up; it should not always be a question.',
    'Return ONLY valid JSON with the eight fields plus assistant_message.'
  ].join('\n');
  const response=await fetch(API_URL,{
    method:'POST',
    headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY,'Content-Type':'application/json'},
    body:JSON.stringify({model,instructions,input:[{role:'user',content:[{type:'input_text',text:JSON.stringify(input)}]}],text:{format:{type:'json_schema',name:'production_intake',strict:true,schema:{type:'object',additionalProperties:false,properties:{client:{type:['string','null']},project:{type:['string','null']},location:{type:['string','null']},deliverables:{type:['string','null']},deadline:{type:['string','null']},budget:{type:['string','null']},references:{type:['string','null']},requirements:{type:['string','null']},assistant_message:{type:'string'}},required:['client','project','location','deliverables','deadline','budget','references','requirements','assistant_message']}}}})
  });
  if(!response.ok) throw new Error('OpenAI request failed: '+response.status+' '+await response.text());
  const data=await response.json(); const text=extractText(data);
  if(!text) throw new Error('OpenAI returned no structured output');
  return JSON.parse(text);
}