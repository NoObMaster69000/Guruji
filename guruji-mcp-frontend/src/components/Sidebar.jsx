import React from 'react';
import SystemPromptEditor from './SystemPromptEditor';
import ToolSelector from './ToolSelector';
import DataUploader from './DataUploader';

const Sidebar = ({
  systemPrompt,
  setSystemPrompt,
  selectedTools,
  setSelectedTools,
  uploadedFiles,
  setUploadedFiles
}) => {
  return (
    <div className="sidebar">
      <h2>🔮 Guruji MCP</h2>

      <SystemPromptEditor
        systemPrompt={systemPrompt}
        setSystemPrompt={setSystemPrompt}
      />

      <ToolSelector
        selectedTools={selectedTools}
        setSelectedTools={setSelectedTools}
      />

      <DataUploader
        uploadedFiles={uploadedFiles}
        setUploadedFiles={setUploadedFiles}
      />
    </div>
  );
};

export default Sidebar;
