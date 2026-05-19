import { useState, useEffect } from 'react'
import axios from 'axios'
import { loginWithMicrosoft, fetchData, getHealth } from './services/api'
import FileUploader from './components/FileUploader'
import './App.css'

function App() {
  const [token, setToken] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('idle')
  const [data, setData] = useState<any>(null)
  const [uploadedCount, setUploadedCount] = useState<number>(0)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [activeLLM, setActiveLLM] = useState<string>('AI')

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const health = await getHealth()
        setActiveLLM(health.activeLLM || 'AI')
      } catch (err) {
        console.warn('Failed to fetch health status')
      }
    }
    fetchHealth()

    const urlParams = new URLSearchParams(window.location.search)
    const accessToken = urlParams.get('access_token')
    if (accessToken) {
      setToken(accessToken)
      window.history.replaceState({}, document.title, "/")
    }
  }, [])

  const handleFetch = async () => {
    if (!token) return
    setStatus('fetching')
    try {
      const result = await fetchData(token)
      setData(result)
      setStatus('success')
    } catch (error) {
      console.error(error)
      setStatus('error')
    }
  }

  const handleUploadSuccess = (count: number) => {
    setUploadedCount(prev => prev + count)
  }

  const handleGenerate = async () => {
    setStatus('generating')
    try {
      const response = await axios.post('/api/generate', { accessToken: token })
      setDownloadUrl(response.data.downloadUrl)
      setStatus('completed')
    } catch (error) {
      console.error(error)
      setStatus('error')
    }
  }

  const handleDownload = () => {
    if (downloadUrl) {
      window.location.href = downloadUrl
    }
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>KnowledgeNexus</h1>
      </header>
      <main className="app-main">
        <section className="welcome-section">
          <h2>Welcome</h2>
          <p>This tool helps you organize and share your knowledge with your team. Connect your accounts and upload files to get started.</p>
        </section>
        
        <div className="action-cards">
          <div className="card">
            <h3>1. Microsoft Integration</h3>
            <p>Connect to Outlook and Teams to analyze your communications.</p>
            {!token ? (
              <button className="btn-primary" onClick={loginWithMicrosoft}>Sign in with Microsoft</button>
            ) : (
              <div>
                <p className="success-text">✓ Connected to Microsoft</p>
                <button className="btn-primary" onClick={handleFetch} disabled={status === 'fetching'}>
                  {status === 'fetching' ? 'Fetching...' : 'Fetch Data'}
                </button>
              </div>
            )}
          </div>
          
          <div className="card">
            <h3>2. Local Files</h3>
            <p>Upload READMEs, system files, or documentation.</p>
            <FileUploader onUploadSuccess={handleUploadSuccess} />
            {uploadedCount > 0 && <p className="success-text">✓ {uploadedCount} files uploaded</p>}
          </div>
        </div>

        {(data || uploadedCount > 0) && (
          <section className="data-preview">
            <h3>Progress</h3>
            <div className="progress-stats">
              <p>Microsoft Data: {data ? 'Ready' : 'Not fetched'}</p>
              <p>Local Files: {uploadedCount} files ready</p>
            </div>
            {status !== 'completed' ? (
              <button 
                className="btn-primary generate-btn" 
                onClick={handleGenerate}
                disabled={status === 'generating' || (!data && uploadedCount === 0)}
              >
                {status === 'generating' ? `Analyzing with ${activeLLM}...` : `Generate Knowledge Package with ${activeLLM}`}
              </button>
            ) : (
              <div className="success-zone">
                <p className="success-text large">Documents Generated Successfully!</p>
                <button className="btn-primary download-btn" onClick={handleDownload}>
                  Download Knowledge Package (.zip)
                </button>
              </div>
            )}
          </section>
        )}
        {status === 'error' && <p className="error-text">Something went wrong. Please try again.</p>}
      </main>
    </div>
  )
}

export default App
