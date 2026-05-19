import axios from 'axios';

export class OpenRouterService {
  private apiKey: string;
  private modelId: string;

  constructor(apiKey: string, modelId?: string) {
    this.apiKey = apiKey;
    this.modelId = modelId || "amazon/nova-pro-v1";
  }

  async analyzeKnowledge(emails: any, chats: any, localFiles: string[]) {
    const prompt = `
      You are an expert technical assistant helping a team organize and share their internal knowledge via the KnowledgeNexus platform.
      
      I will provide you with:
      1. Recent emails (summary)
      2. Teams chat messages
      3. Content from local READMEs or system files
      
      Your task is to generate a comprehensive KnowledgeNexus package in Markdown format.
      Divide the output into the following sections:
      - **Active Projects**: Current status, upcoming deadlines, and key goals.
      - **Key Contacts**: Internal and external stakeholders, and what they are responsible for.
      - **Standard Procedures**: Best practices, tips, tricks, or specific workflows mentioned in chats or files.
      - **Critical Issues**: Any ongoing bugs, blockers, or maintenance tasks.
      
      DATA:
      
      EMAILS:
      ${JSON.stringify(emails)}
      
      TEAMS CHATS:
      ${JSON.stringify(chats)}
      
      LOCAL FILES CONTENT:
      ${localFiles.join('\n---\n')}
    `;

    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: this.modelId,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        },
        {
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://knowledge-bot.local", // Optional, for OpenRouter rankings
            "X-Title": "Knowledge Bot", // Optional, for OpenRouter rankings
          },
        }
      );

      return response.data.choices[0].message.content;
    } catch (error: any) {
      console.error("OpenRouter Error:", error.response?.data || error.message);
      throw new Error("Failed to generate content with OpenRouter");
    }
  }
}
