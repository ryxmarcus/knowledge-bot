import { BedrockClient, ListInferenceProfilesCommand } from "@aws-sdk/client-bedrock";
import dotenv from "dotenv";

dotenv.config();

async function listProfiles() {
  const client = new BedrockClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  try {
    const response = await client.send(new ListInferenceProfilesCommand({}));
    console.log("Available Inference Profiles:");
    response.inferenceProfileSummaries?.forEach((p) => console.log(`- ${p.inferenceProfileId} (${p.inferenceProfileName})`));
  } catch (error) {
    console.error("Error listing profiles:", error);
  }
}

listProfiles();
