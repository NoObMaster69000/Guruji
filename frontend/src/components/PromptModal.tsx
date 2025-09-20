import React, { useState, useEffect, useRef } from 'react';
import { X, Smile } from 'lucide-react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

export interface PromptTemplate {
  id: string;
  title: string;
  text: string;
}

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (prompt: Omit<PromptTemplate, 'id'> & { id?: string }) => void;
  promptToEdit?: PromptTemplate | null;
}

export const PromptModal: React.FC<PromptModalProps> = ({ isOpen, onClose, onSave, promptToEdit }) => {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (promptToEdit) {
      setTitle(promptToEdit.title);
      setText(promptToEdit.text);
    } else {
      setTitle('');
      setText('');
    }
  }, [promptToEdit, isOpen]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setIsEmojiPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !text.trim()) return;
    onSave({ id: promptToEdit?.id, title, text });
    onClose();
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = text.substring(0, start) + emojiData.emoji + text.substring(end);
      setText(newText);
      textarea.focus();
      // The timeout helps ensure the cursor is placed correctly after the state update.
      setTimeout(() => textarea.setSelectionRange(start + emojiData.emoji.length, start + emojiData.emoji.length), 0);
    }
    setIsEmojiPickerOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg m-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {promptToEdit ? 'Edit Prompt' : 'Create New Prompt'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="e.g., 'Summarize Text'"
              required
            />
          </div>
          <div className="mb-6 relative">
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="text" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Prompt Text
              </label>
              <button type="button" onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
                <Smile size={20} />
              </button>
            </div>
            <textarea
              id="text"
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="e.g., 'Summarize the following text: {{text}}'"
              rows={6}
              required
            />
            {isEmojiPickerOpen && (
              <div ref={emojiPickerRef} className="absolute right-0 top-8 z-10">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
            >
              Save Prompt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
