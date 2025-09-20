import React from 'react';
import { Plus, MessageSquare, Search, Trash2, Edit, FileText, Database } from 'lucide-react';
import { ChatSession } from '../App';
import { PromptTemplate } from './PromptModal';
import { KnowledgeBaseList } from './KnowledgeBaseList';

interface SidebarProps {
  isOpen: boolean;
  chatSessions: ChatSession[];
  activeChatId: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id:string) => void;
  promptTemplates: PromptTemplate[];
  onNewPrompt: () => void;
  onEditPrompt: (prompt: PromptTemplate) => void;
  onDeletePrompt: (id: string) => void;
  onUsePrompt: (text: string) => void;
  onNewKnowledgeBase: () => void;
  selectedKbs: string[];
  setSelectedKbs: (ids: string[]) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  chatSessions,
  activeChatId,
  searchQuery,
  setSearchQuery,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  promptTemplates,
  onNewPrompt,
  onEditPrompt,
  onDeletePrompt,
  onUsePrompt,
  onNewKnowledgeBase,
  selectedKbs,
  setSelectedKbs,
}) => {
  return (
    <aside className={`absolute z-20 h-full flex flex-col bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} w-64`}>
      <div className="p-4">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-[--theme-color] text-white hover:opacity-90 transition-colors"
        >
          <Plus size={20} />
          <span>New Chat</span>
        </button>
      </div>

      <div className="p-2 relative">
        <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 pl-10 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <nav className="flex-1 overflow-y-auto space-y-1 px-2">
        <h2 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2 mt-4 px-2">Chats</h2>
        {chatSessions.map(session => (
          <div
            key={session.id}
            onClick={() => onSelectChat(session.id)}
            className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
              activeChatId === session.id
                ? 'bg-blue-100 dark:bg-blue-900/50'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center gap-2 overflow-hidden">
                <MessageSquare size={16} className="text-gray-600 dark:text-gray-300 flex-shrink-0" />
                <span className="text-sm truncate text-gray-800 dark:text-gray-200">{session.title}</span>
            </div>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(session.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 ml-2 flex-shrink-0"
                aria-label="Delete chat"
            >
                <Trash2 size={16} />
            </button>
          </div>
        ))}
      </nav>

      <div className="mt-4 p-2">
        <h2 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2 px-2">Knowledge Base</h2>
        <div className="space-y-2">
            <button
              onClick={onNewKnowledgeBase}
              className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-[--theme-color] text-white hover:opacity-90 transition-colors">
                <Database size={16} />
                Create Vector Store
            </button>
            <KnowledgeBaseList selectedKbs={selectedKbs} setSelectedKbs={setSelectedKbs} />
        </div>
      </div>

      <div className="mt-auto p-2">
         <h2 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2 px-2">Prompts Hub</h2>
         <div className="space-y-1">
            <button
                onClick={onNewPrompt}
                className="w-full flex items-center gap-2 p-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
                <Plus size={16} />
                New Prompt
            </button>
            {promptTemplates.map(prompt => (
                <div key={prompt.id} className="group flex items-center justify-between p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
                    <div onClick={() => onUsePrompt(prompt.text)} className="flex items-center gap-2 cursor-pointer overflow-hidden">
                        <FileText size={16} className="flex-shrink-0" />
                        <span className="text-sm truncate">{prompt.title}</span>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 flex items-center flex-shrink-0">
                        <button onClick={() => onEditPrompt(prompt)} className="p-1 text-gray-500 hover:text-blue-500"><Edit size={14} /></button>
                        <button onClick={() => onDeletePrompt(prompt.id)} className="p-1 text-gray-500 hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                </div>
            ))}
         </div>
      </div>
    </aside>
  );
};
