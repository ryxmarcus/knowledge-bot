import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { OpenRouterService } from './services/openrouter';
import { ZipService } from './services/zipService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const upload = multer({ dest: 'uploads/' });

// Initialize OpenRouter Service
const openRouterService = new OpenRouterService(
  process.env.OPENROUTER_API_KEY || "",
  process.env.OPENROUTER_MODEL_ID
);

app.use(cors());
app.use(express.json());

// Ensure directories exist
['uploads', 'output'].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'KnowledgeNexus API is running',
    openRouterEnabled: !!process.env.OPENROUTER_API_KEY,
    activeLLM: 'OpenRouter'
  });
});

app.post('/api/upload', upload.array('files'), (req, res) => {
  const files = req.files as Express.Multer.File[];
  console.log('Files uploaded:', files.map(f => f.originalname));
  res.json({ message: 'Files uploaded successfully', count: files.length });
});

app.post('/api/generate', async (req, res) => {
  const requestId = Date.now().toString();
  const zipPath = path.join('output', `handover_${requestId}.zip`);
  
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key is not configured on the server.');
    }

    // 1. Read Uploaded Files
    const localFilesContent: string[] = [];
    const files = fs.readdirSync('uploads');
    for (const file of files) {
      const content = fs.readFileSync(path.join('uploads', file), 'utf-8');
      localFilesContent.push(`File: ${file}\nContent:\n${content}`);
    }

    // 2. Generate with OpenRouter
    console.log('Generating with OpenRouter...');
    const result = await openRouterService.analyzeKnowledge([], [], localFilesContent);

    // 3. Create Zip
    await ZipService.createHandoverZip(result, zipPath);

    // 4. Cleanup uploads
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
    res.download(zipPath, 'KnowledgeNexus_Export.zip', () => {
      fs.unlinkSync(zipPath); // Delete after download
    });
  } else {
    res.status(404).send('File not found');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
