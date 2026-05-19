import { BedrockClient, ListFoundationModelsCommand } from "@aws-sdk/client-bedrock";
import dotenv from "dotenv";

dotenv.config();

async function listModels() {
  const client = new BedrockClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  try {
    const response = await client.send(new ListFoundationModelsCommand({ byProvider: "anthropic" }));
    console.log("Available Anthropic Models:");
    response.modelSummaries?.forEach((m) => console.log(`- ${m.modelId}`));
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();
