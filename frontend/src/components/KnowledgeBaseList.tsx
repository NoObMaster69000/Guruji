import React, { useState, useEffect } from 'react';
import { Search, CheckSquare, Square, Edit, Trash2 } from 'lucide-react';

interface KnowledgeBase {
  id: string;
  kb_name: string;
  vector_store: string;
  chunking_strategy: string;
}

interface KnowledgeBaseListProps {
  selectedKbs: string[];
  setSelectedKbs: (ids: string[]) => void;
}

export const KnowledgeBaseList: React.FC<KnowledgeBaseListProps> = ({ selectedKbs, setSelectedKbs }) => {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [filteredKbs, setFilteredKbs] = useState<KnowledgeBase[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('http://localhost:8000/kb/list')
      .then(response => response.json())
      .then(data => {
        setKnowledgeBases(data);
        setFilteredKbs(data);
      })
      .catch(error => console.error('Error fetching knowledge bases:', error));
  }, []);

  useEffect(() => {
    const results = knowledgeBases.filter(kb =>
      kb.kb_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredKbs(results);
  }, [searchTerm, knowledgeBases]);

  const handleSelectKb = (id: string) => {
    const newSelectedKbs = selectedKbs.includes(id)
      ? selectedKbs.filter(kbId => kbId !== id)
      : [...selectedKbs, id];
    setSelectedKbs(newSelectedKbs);
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search knowledge bases..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 pl-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto pr-2 -mr-2">
        {filteredKbs.map(kb => (
          <div
            key={kb.id}
            className="group flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <div onClick={() => handleSelectKb(kb.id)} className="flex items-center gap-3 overflow-hidden">
              {selectedKbs.includes(kb.id) ? (
                <CheckSquare className="text-blue-500" size={20} />
              ) : (
                <Square className="text-gray-400" size={20} />
              )}
              <div className="truncate">
                <p className="font-semibold text-sm text-gray-800 dark:text-white truncate">{kb.kb_name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {kb.vector_store} | {kb.chunking_strategy}
                </p>
              </div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 flex items-center flex-shrink-0 ml-2">
                <button onClick={() => console.log('Edit KB:', kb.id)} className="p-1 text-gray-500 hover:text-blue-500"><Edit size={14} /></button>
                <button onClick={() => console.log('Delete KB:', kb.id)} className="p-1 text-gray-500 hover:text-red-500"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
