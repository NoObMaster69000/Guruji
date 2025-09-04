import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import './App.css';

function App() {
  const [systemPrompt, setSystemPrompt] = useState('You are Guruji, an AI assistant that helps with system management and data analysis.');
  const [selectedTools, setSelectedTools] = useState(['device-control', 'data-analysis']);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  return (
    <div className="app">
      <Sidebar
        systemPrompt={systemPrompt}
        setSystemPrompt={setSystemPrompt}
        selectedTools={selectedTools}
        setSelectedTools={setSelectedTools}
        uploadedFiles={uploadedFiles}
        setUploadedFiles={setUploadedFiles}
      />
      <main className="main-content">
        <ChatInterface
          systemPrompt={systemPrompt}
          selectedTools={selectedTools}
          uploadedFiles={uploadedFiles}
        />
      </main>
    </div>
  );
}

export default App;
