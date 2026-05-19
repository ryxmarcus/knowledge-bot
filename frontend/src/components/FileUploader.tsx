import React, { useState } from 'react';
import axios from 'axios';

interface FileUploaderProps {
  onUploadSuccess: (count: number) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onUploadSuccess }) => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
    }
  };

  const handleUpload = async () => {
    if (!files) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    setUploading(true);
    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onUploadSuccess(response.data.count);
      setFiles(null);
    } catch (error) {
      console.error('Upload failed', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="file-uploader">
      <input 
        type="file" 
        multiple 
        onChange={handleFileChange} 
        id="file-input"
        className="hidden-input"
      />
      <label htmlFor="file-input" className="btn-secondary">
        {files ? `${files.length} files selected` : 'Select Files'}
      </label>
      {files && (
        <button 
          onClick={handleUpload} 
          disabled={uploading}
          className="btn-primary"
          style={{ marginTop: '10px' }}
        >
          {uploading ? 'Uploading...' : 'Upload Now'}
        </button>
      )}
    </div>
  );
};

export default FileUploader;
