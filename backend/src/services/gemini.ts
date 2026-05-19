import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async analyzeKnowledge(emails: any, chats: any, localFiles: string[]) {
    const prompt = `
      You are an expert technical assistant helping a departing employee document their knowledge for their successor.
      
      I will provide you with:
      1. Recent emails (summary)
      2. Teams chat messages
      3. Content from local READMEs or system files
      
      Your task is to generate a comprehensive handover package in Markdown format.
      Divide the output into the following sections:
      - **Active Projects**: Current status, upcoming deadlines, and key goals.
      - **Key Contacts**: Internal and external stakeholders, and what they are responsible for.
      - **Undocumented Procedures**: Any tips, tricks, or specific workflows mentioned in chats or files.
      - **Critical Issues**: Any ongoing bugs or blockers that need immediate attention.
      
      DATA:
      
      EMAILS:
      ${JSON.stringify(emails)}
      
      TEAMS CHATS:
      ${JSON.stringify(chats)}
      
      LOCAL FILES CONTENT:
      ${localFiles.join('\n---\n')}
    `;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }
}
