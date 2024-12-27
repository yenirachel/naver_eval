import axios from 'axios';

interface CompletionRequest {
  messages: Array<{
    role: string;
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
}

interface CompletionResponse {
  result: {
    message: {
      content: string;
    };
    usage?: {
      total_tokens: number;
      completion_tokens: number;
      prompt_tokens: number;
    };
  };
}

interface TokenResponse {
  result: {
    accessToken: string;
  };
}

export class ChatCompletionExecutor {
  private host: string;
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;

  constructor(clientId: string, clientSecret: string) {
    this.host = "https://api-hyperclova.navercorp.com";
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    if (!this.host || !this.clientId || !this.clientSecret) {
      throw new Error("Missing required credentials");
    }
  }

  private async refreshAccessToken(): Promise<void> {
    try {
      const response = await axios.get<TokenResponse>(`${this.host}/v1/auth/token?existingToken=true`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
        }
      });
      this.accessToken = response.data.result.accessToken;
    } catch (error) {
      console.error("Error refreshing access token:", error);
      throw error;
    }
  }

  async execute(completionRequest: CompletionRequest): Promise<CompletionResponse> {
    if (!this.accessToken) {
      await this.refreshAccessToken();
    }

    try {
      const response = await axios.post<CompletionResponse>(
        `${this.host}/v1/chat-completions/HCX-DASH-001`,
        completionRequest,
        {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        this.accessToken = null;
        return this.execute(completionRequest);
      }
      throw error;
    }
  }
}

