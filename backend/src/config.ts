import { Configuration, LogLevel } from "@azure/msal-node";

export const msalConfig: Configuration = {
  auth: {
    clientId: process.env.MS_CLIENT_ID || "",
    authority: `https://login.microsoftonline.com/${process.env.MS_TENANT_ID || "common"}`,
    clientSecret: process.env.MS_CLIENT_SECRET || "",
  },
};

export const REDIRECT_URI = process.env.REDIRECT_URI || "http://localhost:3001/api/auth/callback";
export const MS_GRAPH_SCOPE = ["user.read", "mail.read", "chat.read", "channelmessage.read"];
