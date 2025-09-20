import React, { useState, useEffect } from 'react';
import { X, Plus, UploadCloud, File as FileIcon, Trash2 } from 'lucide-react';

interface FileMetadata {
    id: string;
    name: string;
    uploadDate: string;
    type: string;
    file: File;
}

interface KnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  themeColor: string;
}

export const KnowledgeBaseModal: React.FC<KnowledgeBaseModalProps> = ({ isOpen, onClose, onSave, themeColor }) => {
  const [kbName, setKbName] = useState('');
  const [vectorStore, setVectorStore] = useState('Chroma');
  const [allowedFileTypes, setAllowedFileTypes] = useState<string[]>([]);
  const [parsingLibrary, setParsingLibrary] = useState('Docling');
  const [fileMetadata, setFileMetadata] = useState<FileMetadata[]>([]);
  const [chunkingStrategy, setChunkingStrategy] = useState('Recursive');
  const [chunkSize, setChunkSize] = useState(1024);
  const [chunkOverlap, setChunkOverlap] = useState(200);
  const [metadataStrategy, setMetadataStrategy] = useState('File name, Date of Upload, Document Type');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
        kbName,
        vectorStore,
        allowedFileTypes,
        parsingLibrary,
        chunkingStrategy,
        chunkSize,
        chunkOverlap,
        metadataStrategy,
        files: fileMetadata.map(f => f.file),
    };
    onSave(data);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    const newFileMetadata: FileMetadata[] = newFiles.map(file => ({
        id: `${file.name}-${Date.now()}`,
        name: file.name,
        uploadDate: new Date().toLocaleDateString(),
        type: file.type || 'Unknown',
        file: file,
    }));
    setFileMetadata(prev => [...prev, ...newFileMetadata]);
  };

  const handleRemoveFile = (id: string) => {
    setFileMetadata(prev => prev.filter(f => f.id !== id));
  };

  const handleMetadataChange = (id: string, field: keyof FileMetadata, value: string) => {
    setFileMetadata(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const handleFileTypeChange = (fileType: string) => {
    setAllowedFileTypes(prev =>
      prev.includes(fileType)
        ? prev.filter(ft => ft !== fileType)
        : [...prev, fileType]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl m-4 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Create Knowledge Base
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6">
          {/* Knowledge Base Name */}
          <div className="mb-4">
            <label htmlFor="kbName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Knowledge Base Name
            </label>
            <input
              type="text"
              id="kbName"
              value={kbName}
              onChange={(e) => setKbName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="e.g., 'Project Documentation'"
              required
            />
          </div>

          {/* Vector Store Type */}
          <div className="mb-4">
            <label htmlFor="vectorStore" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Vector Store Type
            </label>
            <select
              id="vectorStore"
              value={vectorStore}
              onChange={(e) => setVectorStore(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option>Chroma</option>
              <option>FAISS</option>
            </select>
          </div>

          {/* Allowed File Types */}
          <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Allowed File Types</label>
              <div className="flex flex-wrap gap-2">
                  {['PDF', 'DOCX', 'TEXT', 'IMAGE', 'ZIP', 'CSV', 'EXCEL'].map(fileType => (
                      <button
                          type="button"
                          key={fileType}
                          onClick={() => handleFileTypeChange(fileType)}
                          className={`px-3 py-1 rounded-full text-sm ${
                              allowedFileTypes.includes(fileType)
                                  ? 'bg-[--theme-color] text-white'
                                  : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200'
                          }`}
                          style={allowedFileTypes.includes(fileType) ? { backgroundColor: themeColor } : {}}
                      >
                          {fileType}
                      </button>
                  ))}
              </div>
          </div>

          {/* Chunking Strategy */}
          <div className="mb-4">
            <label htmlFor="chunkingStrategy" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Chunking Strategy
            </label>
            <select
              id="chunkingStrategy"
              value={chunkingStrategy}
              onChange={(e) => setChunkingStrategy(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option>Recursive</option>
              <option>Fixed Size</option>
            </select>
          </div>

          {/* Chunk Size */}
          <div className="mb-4">
            <label htmlFor="chunkSize" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Chunk Size: <span className="font-semibold">{chunkSize}</span>
            </label>
            <input
              type="range"
              id="chunkSize"
              min="128"
              max="2048"
              step="128"
              value={chunkSize}
              onChange={(e) => setChunkSize(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>

          {/* Chunk Overlap */}
          <div className="mb-4">
            <label htmlFor="chunkOverlap" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Chunk Overlap: <span className="font-semibold">{chunkOverlap}</span>
            </label>
            <input
              type="range"
              id="chunkOverlap"
              min="0"
              max="1024"
              step="64"
              value={chunkOverlap}
              onChange={(e) => setChunkOverlap(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>

          {/* Meta Data Strategy */}
          <div className="mb-4">
            <label htmlFor="metadataStrategy" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Meta Data Strategy
            </label>
            <input
              type="text"
              id="metadataStrategy"
              value={metadataStrategy}
              onChange={(e) => setMetadataStrategy(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="e.g., 'File name, Author, Date'"
            />
          </div>


          {/* Parsing Library */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parsing Library</label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="parsingLibrary"
                  value="Docling"
                  checked={parsingLibrary === 'Docling'}
                  onChange={(e) => setParsingLibrary(e.target.value)}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Free Tier (Docling)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="parsingLibrary"
                  value="LlamaParse"
                  checked={parsingLibrary === 'LlamaParse'}
                  onChange={(e) => setParsingLibrary(e.target.value)}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Paid (LlamaParse)</span>
              </label>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload Files</label>
            <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                            <span>Upload files</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleFileChange} />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500">PDF, DOCX, TEXT, etc.</p>
                </div>
            </div>
            {fileMetadata.length > 0 && (
                <div className="mt-4 space-y-4 max-h-48 overflow-y-auto">
                    {fileMetadata.map((meta) => (
                        <div key={meta.id} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FileIcon className="h-6 w-6 text-gray-500" />
                                    <h4 className="font-semibold text-sm">{meta.name}</h4>
                                </div>
                                <button onClick={() => handleRemoveFile(meta.id)} className="text-gray-500 hover:text-red-500">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500">File Name</label>
                                    <input
                                        type="text"
                                        value={meta.name}
                                        onChange={(e) => handleMetadataChange(meta.id, 'name', e.target.value)}
                                        className="w-full p-1.5 mt-1 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500">Upload Date</label>
                                    <input
                                        type="text"
                                        value={meta.uploadDate}
                                        onChange={(e) => handleMetadataChange(meta.id, 'uploadDate', e.target.value)}
                                        className="w-full p-1.5 mt-1 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500">Document Type</label>
                                    <input
                                        type="text"
                                        value={meta.type}
                                        onChange={(e) => handleMetadataChange(meta.id, 'type', e.target.value)}
                                        className="w-full p-1.5 mt-1 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t dark:border-gray-700 -mx-6 px-6 pb-0 sticky bottom-0 bg-white dark:bg-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[--theme-color] text-white hover:opacity-90"
              style={{ backgroundColor: themeColor }}
            >
              Submit
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
