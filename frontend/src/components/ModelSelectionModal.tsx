import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { ModelSettings } from '../App';

export type ModelProvider = 'Gemini' | 'OpenAI';

export interface ApiKeys {
  [key: string]: string;
}

interface ModelSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (provider: ModelProvider, keys: ApiKeys, settings: ModelSettings) => void;
  currentModel: ModelProvider;
  apiKeys: ApiKeys;
  modelSettings: ModelSettings;
}

export const ModelSelectionModal: React.FC<ModelSelectionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentModel,
  apiKeys,
  modelSettings,
}) => {
  const [selectedModel, setSelectedModel] = useState<ModelProvider>(currentModel);
  const [localApiKeys, setLocalApiKeys] = useState<ApiKeys>(apiKeys);
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);
  const [localSettings, setLocalSettings] = useState<ModelSettings>(modelSettings);

  useEffect(() => {
    setSelectedModel(currentModel);
    setLocalApiKeys(apiKeys);
    setLocalSettings(modelSettings);
  }, [isOpen, currentModel, apiKeys, modelSettings]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(selectedModel, localApiKeys, localSettings);
    onClose();
  };

  const handleKeyChange = (provider: string, key: string) => {
    setLocalApiKeys(prev => ({ ...prev, [provider]: key }));
  };

  const handleSettingChange = (field: keyof ModelSettings, value: string | number) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg m-4 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Select Model
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto pr-2 -mr-4">
          <div>
            <label htmlFor="model-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Model Provider
            </label>
            <select
              id="model-select"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as ModelProvider)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="Gemini">Gemini</option>
              <option value="OpenAI">OpenAI</option>
            </select>
          </div>

          <div className="relative">
            <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {selectedModel} API Key
            </label>
            <input
              type={isApiKeyVisible ? 'text' : 'password'}
              id="api-key"
              value={localApiKeys[selectedModel] || ''}
              onChange={(e) => handleKeyChange(selectedModel, e.target.value)}
              className="w-full p-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder={`Enter your ${selectedModel} API key`}
            />
            <button
              type="button"
              onClick={() => setIsApiKeyVisible(!isApiKeyVisible)}
              className="absolute inset-y-0 right-0 top-6 flex items-center px-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
            >
              {isApiKeyVisible ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Model Parameters</h3>

          <div>
            <label htmlFor="model-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Model Name
            </label>
            <input
              type="text"
              id="model-name"
              value={localSettings.model}
              onChange={(e) => handleSettingChange('model', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="e.g., gpt-4, gemini-pro"
            />
          </div>

          <div>
            <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Temperature: <span className="font-semibold">{localSettings.temperature.toFixed(2)}</span>
            </label>
            <input
              type="range"
              id="temperature"
              min="0"
              max="2"
              step="0.01"
              value={localSettings.temperature}
              onChange={(e) => handleSettingChange('temperature', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="max_tokens" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Tokens</label>
              <input type="number" id="max_tokens" value={localSettings.max_tokens} onChange={(e) => handleSettingChange('max_tokens', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div>
              <label htmlFor="timeout" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Timeout (s)</label>
              <input type="number" id="timeout" value={localSettings.timeout} onChange={(e) => handleSettingChange('timeout', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div>
              <label htmlFor="max_retries" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Retries</label>
              <input type="number" id="max_retries" value={localSettings.max_retries} onChange={(e) => handleSettingChange('max_retries', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600" />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};