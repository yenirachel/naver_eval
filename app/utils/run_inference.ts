import { ChatCompletionExecutor } from './chatCompletionExecutor'

export async function run_inference(data: any[], system_prompt: string, user_input: string): Promise<any[]> {
  if (!data || data.length === 0) {
    throw new Error("No data provided for inference")
  }

  try {
    const chat_completion_executor = new ChatCompletionExecutor()

    const row = data[0]
    try {
      const system = system_prompt ? row[system_prompt] || "" : ""
      const text = user_input ? row[user_input] || "" : ""
      
      const request_data = {
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

      const response = await chat_completion_executor.execute(request_data)
      
      console.log('API Response:', JSON.stringify(response, null, 2))  // Log the full response

      if (response && response.status && response.status.code === "20000" && response.result && response.result.message && response.result.message.content) {
        row['assistant'] = response.result.message.content.trim()
      } else {
        console.error('Unexpected response structure:', response)
        throw new Error("Unexpected response format")
      }
    } catch (error) {
      console.error(`Error processing row: ${error}`)
      row['assistant'] = `Error occurred during inference: ${error}`
    }

    return [row]
  } catch (error) {
    console.error(`Error in run_inference: ${error}`)
    throw error
  }
}

