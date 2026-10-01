const API_URL='https://api.openai.com/v1/responses';

function extractText(data){
  if(data.output_text) return data.output_text;
  const parts=[];
  for(const item of data.output||[]){
    for(const content of item.content||[]){
      if(content.type==='output_text' && content.text) parts.push(content.text);
    }
  }
  return parts.join('\n');
}

export async function runOpenAI(input){
  if(!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not configured');

  const model=process.env.OPENAI_MODEL || 'gpt-5.6-luna';
  const instructions=`You are the Movie Park AI Production Intake Assistant.
Your job is to understand a production inquiry and return ONLY valid JSON.
Never invent missing facts. Use null for unknown values.
Fields: client, project, location, deliverables, deadline, budget, references, requirements.
Also return assistant_message: a concise natural-language response asking for the next most important missing detail.
Do not quote prices, promise availability, or claim access to Movie Park internal systems.`;

  const response=await fetch(API_URL,{
    method:'POST',
    headers:{
      Authorization:'Bearer '+process.env.OPENAI_API_KEY,
      'Content-Type':'application/json'
    },
    body:JSON.stringify({
      model,
      instructions,
      input:[{role:'user',content:[{type:'input_text',text:JSON.stringify(input)}]}],
      text:{format:{
        type:'json_schema',
        name:'production_intake',
        strict:true,
        schema:{
          type:'object',
          additionalProperties:false,
          properties:{
            client:{type:['string','null']},
            project:{type:['string','null']},
            location:{type:['string','null']},
            deliverables:{type:['string','null']},
            deadline:{type:['string','null']},
            budget:{type:['string','null']},
            references:{type:['string','null']},
            requirements:{type:['string','null']},
            assistant_message:{type:'string'}
          },
          required:['client','project','location','deliverables','deadline','budget','references','requirements','assistant_message']
        }
      }}
    })
  });

  if(!response.ok) throw new Error('OpenAI request failed: '+response.status+' '+await response.text());
  const data=await response.json();
  const text=extractText(data);
  if(!text) throw new Error('OpenAI returned no structured output');
  return JSON.parse(text);
}
