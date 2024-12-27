interface APIResponse {
  status: {
    code: string;
  };
  result: {
    message: {
      content: string;
    };
  };
 }
 
 interface DataRow {
  [key: string]: string | undefined;
  assistant?: string;
 }
 
 interface RequestData {
  messages: Array<{
    role: string;
    content: string;
  }>;
  maxTokens: number;
  temperature: number;
  topK: number;
  topP: number;
  repeatPenalty: number;
  stopBefore: string[];
  includeAiFilters: boolean;
  seed: number;
 }
 
 import { ChatCompletionExecutor } from './chatCompletionExecutor'
 
 export async function run_inference(
  data: DataRow[], 
  system_prompt: string, 
  user_input: string,
  clientId: string,
  clientSecret: string
 ): Promise<DataRow[]> {
  if (!data || data.length === 0) {
    throw new Error("No data provided for inference")
  }
 
  try {
    const chat_completion_executor = new ChatCompletionExecutor(clientId, clientSecret)
 
    const row = data[0]
    try {
      const system = system_prompt ? row[system_prompt] ?? "" : ""
      const text = user_input ? row[user_input] ?? "" : ""
      
      const request_data: RequestData = {
        messages: [{
          role: "system",
          content: system
        }, {
          role: "user",
          content: text
        }],
        maxTokens: 400,
        temperature: 0.5,
        topK: 0,
        topP: 0.8,
        repeatPenalty: 5.0,
        stopBefore: [],
        includeAiFilters: true,
        seed: 0
      }
 
      const response = await chat_completion_executor.execute(request_data) as APIResponse
      
      console.log('API Response:', JSON.stringify(response, null, 2))
 
      if (response?.status?.code === "20000" && response?.result?.message?.content) {
        row['assistant'] = response.result.message.content.trim()
      } else {
        console.error('Unexpected response structure:', response)
        throw new Error("Unexpected response format")
      }
    } catch (error) {
      console.error(`Error processing row:`, error)
      row['assistant'] = `Error occurred during inference: ${error instanceof Error ? error.message : String(error)}`
    }
 
    return [row]
  } catch (error) {
    console.error(`Error in run_inference:`, error)
    throw error
  }
 }

