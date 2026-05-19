# Knowledge Handover Application

This application helps departing employees document their knowledge using LLMs (Google Gemini) by analyzing their communications (Outlook, Teams) and local documentation (READMEs, system files).

## Features
- **Microsoft 365 Integration**: Connect to Outlook and Teams to extract project context and key contacts.
- **Local File Analysis**: Upload local READMEs, configs, or documentation for synthesis.
- **AI-Powered Synthesis**: Uses Google Gemini to organize raw data into structured handover documents.
- **Portable Output**: Downloads a structured `.zip` archive with Markdown files.

## Setup

### 1. Prerequisites
- Node.js v20+
- A Google Gemini API Key.
- A Microsoft Azure AD (Entra ID) App Registration (for Graph API access).

### 2. Configuration
Create a `.env` file in the `backend/` directory:

```env
PORT=3001
GEMINI_API_KEY=your_gemini_api_key
MS_CLIENT_ID=your_microsoft_client_id
MS_CLIENT_SECRET=your_microsoft_client_secret
MS_TENANT_ID=common
REDIRECT_URI=http://localhost:3001/api/auth/callback
```

### 3. Installation

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 4. Running the App

**Start Backend:**
```bash
cd backend
npm run dev
```

**Start Frontend:**
```bash
cd frontend
npm run dev
```

Open `http://localhost:3000` in your browser.

## Security Note
This tool is designed for local use. Company data is processed by the Google Gemini API but is not stored permanently by this application. Uploaded files and generated archives are deleted after processing/download.
