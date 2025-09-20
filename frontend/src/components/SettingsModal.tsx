import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Color from 'color';
import { SketchPicker, ColorResult } from 'react-color';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeColor: string;
  setThemeColor: (color: string) => void;
  chatbotTitle: string;
  setChatbotTitle: (title: string) => void;
  logo: string | null;
  setLogo: (logo: string | null) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  themeColor,
  setThemeColor,
  chatbotTitle,
  setChatbotTitle,
  logo,
  setLogo,
}) => {
  // Local state to hold pending changes
  const [localTitle, setLocalTitle] = useState(chatbotTitle);
  const [localColor, setLocalColor] = useState(themeColor);
  const [localLogo, setLocalLogo] = useState(logo);

  // Reset local state if the modal is reopened with different props
  useEffect(() => {
    if (isOpen) {
      setLocalTitle(chatbotTitle);
      setLocalColor(themeColor);
      setLocalLogo(logo);
    }
  }, [isOpen, chatbotTitle, themeColor, logo]);

  if (!isOpen) return null;

  const handleColorChange = (color: ColorResult) => {
    // Update local state instead of parent
    setLocalColor(color.hex);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && ['image/jpeg', 'image/png', 'image/svg+xml'].includes(file.type)) {
      if (file.size > 2 * 1024 * 1024) { // 2MB size limit
        alert('File size should not exceed 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        // Update local state
        setLocalLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload a valid image file (JPG, PNG, SVG).');
    }
  };

  const handleSubmit = () => {
    // Apply changes to the parent component's state
    setChatbotTitle(localTitle);
    setThemeColor(localColor);
    setLogo(localLogo);
    onClose(); // Close the modal after saving
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4 flex flex-col">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Settings</h2>
          <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Chatbot Title */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">Chatbot Title</h3>
            <input
              type="text"
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Custom Logo */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">Custom Logo</h3>
            <input
              type="file"
              accept="image/png, image/jpeg, image/svg+xml"
              onChange={handleLogoUpload}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-gray-700 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-gray-600"
            />
            {localLogo && <img src={localLogo} alt="Logo Preview" className="mt-4 h-10 w-auto rounded-md bg-gray-200 p-1" />}
          </div>

          {/* Color Theme */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">Theme Color</h3>
            <SketchPicker color={localColor} onChangeComplete={handleColorChange} />
          </div>
        </div>
        {/* Footer with Save button */}
        <div className="p-4 border-t dark:border-gray-700 flex justify-end">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-white font-semibold rounded-md transition-colors"
              style={{ 
                backgroundColor: localColor,
                color: localColor && Color(localColor).isDark() ? 'white' : 'black'
              }}
            >
              Save Changes
            </button>
        </div>
      </div>
    </div>
  );
};