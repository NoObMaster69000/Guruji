import React from 'react';

const ToolSelector = ({ selectedTools, setSelectedTools }) => {
  const availableTools = [
    { id: 'device-control', name: 'Device Control', icon: '🎛️' },
    { id: 'data-analysis', name: 'Data Analysis', icon: '📊' },
    { id: 'file-processing', name: 'File Processing', icon: '📁' },
    { id: 'system-monitoring', name: 'System Monitoring', icon: '🖥️' },
    { id: 'api-integration', name: 'API Integration', icon: '🔌' },
    { id: 'report-generation', name: 'Report Generation', icon: '📝' }
  ];

  const toggleTool = (toolId) => {
    setSelectedTools(prev =>
      prev.includes(toolId)
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  };

  return (
    <div className="tool-selector">
      <h3>Available Tools</h3>
      <div className="tool-options">
        {availableTools.map((tool) => (
          <div
            key={tool.id}
            className={`tool-option ${selectedTools.includes(tool.id) ? 'selected' : ''}`}
            onClick={() => toggleTool(tool.id)}
          >
            {tool.icon} {tool.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToolSelector;
