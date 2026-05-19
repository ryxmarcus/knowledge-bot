import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import * as msal from "@azure/msal-node";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { msalConfig, MS_GRAPH_SCOPE, REDIRECT_URI } from './config';
import { MicrosoftGraphService } from './services/microsoftGraph';
import { GeminiService } from './services/gemini';
import { ZipService } from './services/zipService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const upload = multer({ dest: 'uploads/' });
const geminiService = new GeminiService(process.env.GEMINI_API_KEY || "");

let pca: msal.ConfidentialClientApplication | null = null;
try {
  if (msalConfig.auth.clientId && msalConfig.auth.clientSecret) {
    pca = new msal.ConfidentialClientApplication(msalConfig);
  } else {
    console.warn('MS_CLIENT_ID or MS_CLIENT_SECRET not provided. Microsoft integration will be disabled.');
  }
} catch (error) {
  console.error('Failed to initialize MSAL:', error);
}

app.use(cors());
app.use(express.json());

// Ensure directories exist
['uploads', 'output'].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Knowledge Handover API is running',
    microsoftEnabled: !!pca,
    geminiEnabled: !!process.env.GEMINI_API_KEY
  });
});

app.post('/api/upload', upload.array('files'), (req, res) => {
  const files = req.files as Express.Multer.File[];
  console.log('Files uploaded:', files.map(f => f.originalname));
  res.json({ message: 'Files uploaded successfully', count: files.length });
});

app.post('/api/generate', async (req, res) => {
  const { accessToken } = req.body;
  const requestId = Date.now().toString();
  const zipPath = path.join('output', `handover_${requestId}.zip`);
  
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured on the server.');
    }

    // 1. Fetch Microsoft Data
    let emails = [];
    let chats = [];
    if (accessToken) {
      const graphService = new MicrosoftGraphService(accessToken);
      emails = await graphService.getEmails();
      chats = await graphService.getTeamsMessages();
    }

    // 2. Read Uploaded Files
    const localFilesContent: string[] = [];
    const files = fs.readdirSync('uploads');
    for (const file of files) {
      const content = fs.readFileSync(path.join('uploads', file), 'utf-8');
      localFilesContent.push(`File: ${file}\nContent:\n${content}`);
    }

    // 3. Generate with Gemini
    const result = await geminiService.analyzeKnowledge(emails, chats, localFilesContent);

    // 4. Create Zip
    await ZipService.createHandoverZip(result, zipPath);

    // 5. Cleanup uploads
    for (const file of files) {
      fs.unlinkSync(path.join('uploads', file));
    }

    res.json({ downloadUrl: `/api/download/${requestId}` });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Generation failed' });
  }
});

app.get('/api/download/:id', (req, res) => {
  const zipPath = path.join('output', `handover_${req.params.id}.zip`);
  if (fs.existsSync(zipPath)) {
    res.download(zipPath, 'Knowledge_Handover.zip', () => {
      fs.unlinkSync(zipPath); // Delete after download
    });
  } else {
    res.status(404).send('File not found');
  }
});

app.get('/api/auth/login', (req, res) => {
  if (!pca) return res.status(503).send('Microsoft integration is not configured.');

  const authCodeUrlParameters = {
    scopes: MS_GRAPH_SCOPE,
    redirectUri: REDIRECT_URI,
  };

  pca.getAuthCodeUrl(authCodeUrlParameters).then((response) => {
    res.redirect(response);
  }).catch((error) => console.log(JSON.stringify(error)));
});

app.get('/api/auth/callback', (req, res) => {
  if (!pca) return res.status(503).send('Microsoft integration is not configured.');

  const tokenRequest = {
    code: req.query.code as string,
    scopes: MS_GRAPH_SCOPE,
    redirectUri: REDIRECT_URI,
  };

  pca.acquireTokenByCode(tokenRequest).then((response) => {
    // In a real app, you'd store this in a session
    // For MVP, we'll redirect back to frontend with token in query (NOT SECURE for production, but okay for this demo/local tool)
    res.redirect(`http://localhost:3000?access_token=${response.accessToken}`);
  }).catch((error) => {
    console.log(error);
    res.status(500).send(error);
  });
});

app.get('/api/data/fetch', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).send('No token provided');
  
  const token = authHeader.split(' ')[1];
  const graphService = new MicrosoftGraphService(token);
  
  try {
    const emails = await graphService.getEmails();
    const chats = await graphService.getTeamsMessages();
    res.json({ emails, chats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
