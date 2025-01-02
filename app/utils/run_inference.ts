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
    const row = data[0]
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

    const response = await fetch('https://api-hyperclova.navercorp.com/v1/chat-completions/HCX-DASH-001', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAccessToken(clientId, clientSecret)}`
      },
      body: JSON.stringify(request_data)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json() as APIResponse

    if (result?.status?.code === "20000" && result?.result?.message?.content) {
      row['assistant'] = result.result.message.content.trim()
    } else {
      throw new Error("Unexpected response format")
    }

    return [row]
  } catch (error) {
    console.error(`Error in run_inference:`, error)
    throw error
  }
}

async function getAccessToken(clientId: string, clientSecret: string): Promise<string> {
  const response = await fetch('https://api-hyperclova.navercorp.com/v1/auth/token?existingToken=true', {
    headers: {
      'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.status}`)
  }

  const data = await response.json()
  return data.result.accessToken
}

