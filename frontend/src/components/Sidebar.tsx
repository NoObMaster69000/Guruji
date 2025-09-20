import React, { useState } from 'react';
import { Plus, MessageSquare, Search, Trash2, Edit, FileText, Database, ChevronDown, Wrench, Cpu } from 'lucide-react';
import emojiRegex from 'emoji-regex';
import { ChatSession } from '../App';
import { PromptTemplate } from './PromptModal';
import { KnowledgeBaseList } from './KnowledgeBaseList';
import { Tool } from './ToolModal';

interface SidebarProps {
  isOpen: boolean;
  chatSessions: ChatSession[];
  activeChatId: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id:string) => void;
  onEditChat: (session: ChatSession) => void;
  promptTemplates: PromptTemplate[];
  onNewPrompt: () => void;
  onEditPrompt: (prompt: PromptTemplate) => void;
  onDeletePrompt: (id: string) => void;
  onUsePrompt: (text: string) => void;
  tools: Tool[];
  onNewTool: () => void;
  onEditTool: (tool: Tool) => void;
  onDeleteTool: (id: string) => void;
  onUseTool: (tool: Tool) => void;
  onNewKnowledgeBase: () => void;
  selectedKbs: string[];
  onOpenModelModal: () => void;
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
  onEditChat,
  promptTemplates,
  onNewPrompt,
  onEditPrompt,
  onDeletePrompt,
  onUsePrompt,
  tools,
  onNewTool,
  onEditTool,
  onDeleteTool,
  onUseTool,
  onNewKnowledgeBase,
  selectedKbs,
  onOpenModelModal,
  setSelectedKbs,
}) => {
  const [isChatsVisible, setIsChatsVisible] = useState(true);
  const [isKbVisible, setIsKbVisible] = useState(true);
  const [isPromptsVisible, setIsPromptsVisible] = useState(true);
  const [isToolsVisible, setIsToolsVisible] = useState(true);

  const getFirstEmoji = (text: string): string | null => {
    const regex = emojiRegex();
    const match = text.match(regex);
    return match ? match[0] : null;
  };

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

      <div className="flex-1 overflow-y-auto px-2">
        {/* Model Selection Section */}
        <div className="py-2">
            <button
                onClick={onOpenModelModal}
                className="w-full flex items-center gap-2 p-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
                <Cpu size={16} />
                <span>Model</span>
            </button>
        </div>

        {/* Chats Section */}
        <div className="py-2 border-t dark:border-gray-700">
          <div onClick={() => setIsChatsVisible(!isChatsVisible)} className="flex justify-between items-center cursor-pointer px-2 py-1 mb-1 ">
            <h2 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Chats</h2>
            <ChevronDown size={16} className={`text-gray-500 dark:text-gray-400 transition-transform ${isChatsVisible ? 'rotate-180' : ''}`} />
          </div>
          {isChatsVisible && (
            <nav className="space-y-1 mt-2">
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
                      <span className="text-sm truncate text-gray-800 dark:text-gray-200" title={session.description}>{session.title}</span>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 flex items-center flex-shrink-0 ml-2">
                      <button onClick={(e) => {
                            e.stopPropagation();
                            onEditChat(session);
                        }}
                        className="p-1 text-gray-500 hover:text-blue-500"
                        aria-label="Edit chat"
                      >
                          <Edit size={14} />
                      </button>
                      <button
                          onClick={(e) => {
                              e.stopPropagation();
                              onDeleteChat(session.id);
                          }}
                          className="p-1 text-gray-500 hover:text-red-500"
                          aria-label="Delete chat"
                      >
                          <Trash2 size={14} />
                      </button>
                  </div>
                </div>
              ))}
            </nav>
          )}
        </div>

        {/* Knowledge Base Section */}
        <div className="py-2 border-t dark:border-gray-700">
          <div onClick={() => setIsKbVisible(!isKbVisible)} className="flex justify-between items-center cursor-pointer px-2 py-1 mb-1">
            <h2 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Knowledge Base</h2>
            <ChevronDown size={16} className={`text-gray-500 dark:text-gray-400 transition-transform ${isKbVisible ? 'rotate-180' : ''}`} />
          </div>
          {isKbVisible && (
            <div className="space-y-2 mt-2">
                <button
                  onClick={onNewKnowledgeBase}
                  className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-[--theme-color] text-white hover:opacity-90 transition-colors">
                    <Database size={16} />
                    Create Vector Store
                </button>
                <KnowledgeBaseList selectedKbs={selectedKbs} setSelectedKbs={setSelectedKbs} />
            </div>
          )}
        </div>

        <div className="py-2 border-t dark:border-gray-700">
          <div onClick={() => setIsToolsVisible(!isToolsVisible)} className="flex justify-between items-center cursor-pointer px-2 py-1 mb-1">
          <h2 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Tools Hub</h2>
          <ChevronDown size={16} className={`text-gray-500 dark:text-gray-400 transition-transform ${isToolsVisible ? 'rotate-180' : ''}`} />
        </div>
        {isToolsVisible && (
          <div className="space-y-1 mt-2">
            <button
                onClick={onNewTool}
                className="w-full flex items-center gap-2 p-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
                <Plus size={16} />
                New Tool
            </button>
            {tools.map(tool => {
              const emoji = getFirstEmoji(tool.title);
              return (
                  <div key={tool.id} className="group flex items-center justify-between p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
                      <div onClick={() => onUseTool(tool)} className="flex items-center gap-2 cursor-pointer overflow-hidden">
                          <span className="flex-shrink-0 w-5 text-center">
                            {emoji ? <span className="text-lg">{emoji}</span> : <Wrench size={16} />}
                          </span>
                          <span className="text-sm truncate">{tool.title}</span>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 flex items-center flex-shrink-0">
                          <button onClick={() => onEditTool(tool)} className="p-1 text-gray-500 hover:text-blue-500"><Edit size={14} /></button>
                          <button onClick={() => onDeleteTool(tool.id)} className="p-1 text-gray-500 hover:text-red-500"><Trash2 size={14} /></button>
                      </div>
                  </div>
              );
            })}
          </div>
        )}
        </div>

        <div className="py-2 border-t dark:border-gray-700">
          <div onClick={() => setIsPromptsVisible(!isPromptsVisible)} className="flex justify-between items-center cursor-pointer px-2 py-1 mb-1">
          <h2 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Prompts Hub</h2>
          <ChevronDown size={16} className={`text-gray-500 dark:text-gray-400 transition-transform ${isPromptsVisible ? 'rotate-180' : ''}`} />
        </div>
        {isPromptsVisible && (
          <div className="space-y-1 mt-2">
            <button
                onClick={onNewPrompt}
                className="w-full flex items-center gap-2 p-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
                <Plus size={16} />
                New Prompt
            </button>
            {promptTemplates.map(prompt => {
              const emoji = getFirstEmoji(prompt.title);
              return (
                  <div key={prompt.id} className="group flex items-center justify-between p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
                      <div onClick={() => onUsePrompt(prompt.text)} className="flex items-center gap-2 cursor-pointer overflow-hidden">
                          <span className="flex-shrink-0 w-5 text-center">
                            {emoji ? <span className="text-lg">{emoji}</span> : <FileText size={16} />}
                          </span>
                          <span className="text-sm truncate">{prompt.title}</span>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 flex items-center flex-shrink-0">
                          <button onClick={() => onEditPrompt(prompt)} className="p-1 text-gray-500 hover:text-blue-500"><Edit size={14} /></button>
                          <button onClick={() => onDeletePrompt(prompt.id)} className="p-1 text-gray-500 hover:text-red-500"><Trash2 size={14} /></button>
                      </div>
                  </div>
              );
            })}
          </div>
        )}
        </div>
      </div>
    </aside>
  );
};
