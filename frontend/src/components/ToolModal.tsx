import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export interface Tool {
  id: string;
  title: string;
  content: string; // Or some other structure for a tool
}

interface ToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tool: Omit<Tool, 'id'> & { id?: string }) => void;
  toolToEdit?: Tool | null;
}

export const ToolModal: React.FC<ToolModalProps> = ({ isOpen, onClose, onSave, toolToEdit }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (toolToEdit) {
      setTitle(toolToEdit.title);
      setContent(toolToEdit.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [toolToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onSave({ id: toolToEdit?.id, title, content });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg m-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {toolToEdit ? 'Edit Tool' : 'Create New Tool'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4 relative">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tool Name
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="e.g., 'API Fetcher'"
              required
            />
          </div>
          <div className="mb-6 relative">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tool Content/Configuration
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter tool definition or configuration here..."
              rows={6}
              required
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-[--theme-color] text-white hover:opacity-90">Save Tool</button>
          </div>
        </form>
      </div>
    </div>
  );
};