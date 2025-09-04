import React from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiFile, FiX } from 'react-icons/fi';

const DataUploader = ({ uploadedFiles, setUploadedFiles }) => {
  const onDrop = (acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/*': ['.txt', '.csv', '.json'],
      'application/*': ['.pdf', '.doc', '.docx'],
      'image/*': ['.png', '.jpg', '.jpeg']
    }
  });

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="data-uploader">
      <h3>Data Upload</h3>
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'active' : ''}`}
      >
        <input {...getInputProps()} />
        <FiUpload size={48} style={{ color: '#667eea', marginBottom: '10px' }} />
        <p>Drag & drop files here, or click to select files</p>
        <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '5px' }}>
          Supports: TXT, CSV, JSON, PDF, DOC, Images
        </p>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="file-list">
          <h4>Uploaded Files ({uploadedFiles.length})</h4>
          {uploadedFiles.map((file) => (
            <div key={file.id} className="file-item">
              <div className="file-name">
                <FiFile />
                <span>{file.name}</span>
                <span style={{ fontSize: '0.8rem', color: '#666', marginLeft: '10px' }}>
                  ({formatFileSize(file.size)})
                </span>
              </div>
              <button
                className="remove-file"
                onClick={() => removeFile(file.id)}
              >
                <FiX />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DataUploader;
