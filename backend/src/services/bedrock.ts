import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

export class BedrockService {
  private client: BedrockRuntimeClient;
  private modelId: string;

  constructor(region: string, accessKeyId?: string, secretAccessKey?: string) {
    const config: any = { region };
    if (accessKeyId && secretAccessKey) {
      config.credentials = {
        accessKeyId,
        secretAccessKey
      };
    }
    this.client = new BedrockRuntimeClient(config);
    this.modelId = process.env.BEDROCK_MODEL_ID || "us.anthropic.claude-sonnet-4-6";
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

    const body = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    };

    const command = new InvokeModelCommand({
      modelId: this.modelId,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(body),
    });

    try {
      const response = await this.client.send(command);
      const resBody = JSON.parse(new TextDecoder().decode(response.body));
      return resBody.content[0].text;
    } catch (error) {
      console.error("Bedrock Error:", error);
      throw new Error("Failed to generate content with Bedrock");
    }
  }
}
