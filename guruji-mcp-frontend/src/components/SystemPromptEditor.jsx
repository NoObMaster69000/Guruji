import React from 'react';

const SystemPromptEditor = ({ systemPrompt, setSystemPrompt }) => {
  return (
    <div className="system-prompt-editor">
      <h3>System Prompt</h3>
      <textarea
        className="system-prompt-textarea"
        value={systemPrompt}
        onChange={(e) => setSystemPrompt(e.target.value)}
        placeholder="Enter system instructions for Guruji..."
      />
    </div>
  );
};

export default SystemPromptEditor;
