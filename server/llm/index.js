import { runOpenAI } from './openai.js';

export async function runLLM(input){
  const provider=process.env.LLM_PROVIDER || 'local';
  if(provider==='openai') return runOpenAI(input);
  return null;
}
