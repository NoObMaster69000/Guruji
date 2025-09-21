import React, { useState, useEffect, useRef, FormEvent, KeyboardEvent } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatView, Message } from './components/ChatView';
import { PromptModal, PromptTemplate } from './components/PromptModal';
import { SettingsModal } from './components/SettingsModal';
import { ToolModal, Tool } from './components/ToolModal';
import { KnowledgeBaseModal } from './components/KnowledgeBaseModal';
import { ModelSelectionModal, ModelProvider, ApiKeys } from './components/ModelSelectionModal';
import { DatabaseModal, DatabaseConnection } from './components/DatabaseModal';
import { ChatSessionModal } from './components/ChatSessionModal';
import LoginPage from './components/LoginPage';
import { v4 as uuidv4 } from 'uuid';

// --- Type Definitions ---
export interface ChatSession {
  id: string;
  title: string;
  description?: string;
  messages: Message[];
}

export interface ModelSettings {
  model: string;
  temperature: number;
  timeout: number;
  max_tokens: number;
  max_retries: number;
}

// =================================================================================
// --- Main App Component ---
// =================================================================================
const App: React.FC = () => {
  // --- State Management ---
  const [logo, setLogo] = useState<string | null>(null);
  const [chatbotTitle, setChatbotTitle] = useState('Chatbot');
  const [themeColor, setThemeColor] = useState('#007bff');
  const [darkMode, setDarkMode] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [promptTemplates, setPromptTemplates] = useState<PromptTemplate[]>([
    { id: '1', title: 'Summarize Text', text: 'Please summarize the following text:\n\n' }
  ]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [isToolModalOpen, setIsToolModalOpen] = useState(false);
  const [promptToEdit, setPromptToEdit] = useState<PromptTemplate | null>(null);
  const [toolToEdit, setToolToEdit] = useState<Tool | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [dbConnections, setDbConnections] = useState<DatabaseConnection[]>([]);
  const [dbConnectionToEdit, setDbConnectionToEdit] = useState<DatabaseConnection | null>(null);
  const [isKbModalOpen, setIsKbModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [chatToEdit, setChatToEdit] = useState<ChatSession | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(256); // Add this state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
<<<<<<< HEAD
  const [userName, setUserName] = useState<string | null>(null);
=======
>>>>>>> parent of 2046c95 (Merge pull request #15 from NoObMaster69000/backend-hubs-1)
  const [selectedKbs, setSelectedKbs] = useState<string[]>([]);
  const [selectedDbs, setSelectedDbs] = useState<string[]>([]);
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [currentModel, setCurrentModel] = useState<ModelProvider>('Gemini');
  const [apiKeys, setApiKeys] = useState<ApiKeys>({});
  const [modelSettings, setModelSettings] = useState<ModelSettings>({
    model: 'gemini-pro',
    temperature: 0.7,
    timeout: 120,
    max_tokens: 1024,
    max_retries: 2,
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- Derived State ---
  const activeChat = chatSessions.find(session => session.id === activeChatId);
  const filteredChatSessions = chatSessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- Effects ---

  // Initialize with a default chat session
  useEffect(() => {
    if (chatSessions.length === 0) {
      const newId = uuidv4();
      setChatSessions([{ id: newId, title: 'New Chat', messages: [] }]);
      setActiveChatId(newId);
    }
  }, [chatSessions.length]);

  // Apply dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Apply theme color
  useEffect(() => {
    document.documentElement.style.setProperty('--theme-color', themeColor);
  }, [themeColor]);

  // Auto-focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, [activeChatId]); // Refocus when chat changes

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages, isTyping]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() === '' || !activeChatId) return;

    const userMessage: Message = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString(),
    };

    setChatSessions(prevSessions =>
      prevSessions.map(session =>
        session.id === activeChatId
          ? { ...session, messages: [...session.messages, userMessage] }
          : session
      )
    );

    const messageToSend = input;
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: activeChatId,
          message: messageToSend,
          provider: currentModel,
          ...modelSettings,
          selected_kbs: selectedKbs,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const botMessage: Message = {
        id: Date.now() + 1,
        text: data.reply,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString(),
      };

      setChatSessions(prevSessions =>
        prevSessions.map(session =>
          session.id === activeChatId
            ? { ...session, messages: [...session.messages, botMessage] }
            : session
        )
      );
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: "Sorry, I couldn't get a response. Please try again.",
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString(),
      };
      setChatSessions(prevSessions =>
        prevSessions.map(session =>
          session.id === activeChatId
            ? { ...session, messages: [...session.messages, errorMessage] }
            : session
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSendMessage(e as unknown as FormEvent);
    }
  };

  const handleNewChat = () => {
    const newId = uuidv4();
    const newChat: ChatSession = {
      id: newId,
      title: 'New Chat',
      messages: [],
    };
    setChatSessions(prev => [newChat, ...prev]);
    setActiveChatId(newId);
  };

  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
  };

  const handleDeleteChat = (id: string) => {
    setChatSessions(prev => prev.filter(session => session.id !== id));
    // If the active chat is deleted, switch to another one or set to null
    if (activeChatId === id) {
      setActiveChatId(chatSessions[0]?.id || null);
    }
  };

  const handleEditChat = (session: ChatSession) => {
    setChatToEdit(session);
    setIsChatModalOpen(true);
  };

  const handleSaveChat = (sessionData: { id: string; title: string; description?: string }) => {
    setChatSessions(prev =>
      prev.map(session =>
        session.id === sessionData.id ? { ...session, title: sessionData.title, description: sessionData.description } : session
      )
    );
  };

  const handleSaveModelSelection = (provider: ModelProvider, keys: ApiKeys, settings: ModelSettings) => {
    setCurrentModel(provider);
    setApiKeys(keys);
    setModelSettings(settings);
    // Here you might want to save keys to localStorage for persistence
  };

  // --- Database Connection Handlers ---
  const handleSaveDbConnection = (connectionData: Omit<DatabaseConnection, 'id'> & { id?: string }) => {
    if (connectionData.id) { // Editing
      setDbConnections(prev => prev.map(c => c.id === connectionData.id ? { ...c, ...connectionData } : c));
    } else { // Creating
      setDbConnections(prev => [...prev, { ...connectionData, id: uuidv4() } as DatabaseConnection]);
    }
  };

  const handleDeleteDbConnection = (id: string) => {
    setDbConnections(prev => prev.filter(c => c.id !== id));
  };

  const openNewDbModal = () => {
    setDbConnectionToEdit(null);
    setIsDbModalOpen(true);
  };

  const openEditDbModal = (connection: DatabaseConnection) => {
    setDbConnectionToEdit(connection);
    setIsDbModalOpen(true);
  };

  const handleClearChat = () => {
    if (!activeChatId) return;
    setChatSessions(prevSessions =>
        prevSessions.map(session =>
          session.id === activeChatId
            ? { ...session, messages: [] }
            : session
        )
      );
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // --- Prompt/Tool Handlers ---
  const handleSavePrompt = (promptData: Omit<PromptTemplate, 'id'> & { id?: string }) => {
    if (promptData.id) { // Editing existing prompt
      setPromptTemplates(prev => prev.map(p => p.id === promptData.id ? { ...p, title: promptData.title, text: promptData.text } : p));
    } else { // Creating new prompt
      setPromptTemplates(prev => [...prev, { ...promptData, id: uuidv4() }]);
    }
  };

  const handleDeletePrompt = (id: string) => {
    setPromptTemplates(prev => prev.filter(p => p.id !== id));
  };

  const handleUsePrompt = (text: string) => {
    setInput(text);
    inputRef.current?.focus();
  };

  const openNewPromptModal = () => {
    setPromptToEdit(null);
    setIsPromptModalOpen(true);
  };

  const openEditPromptModal = (prompt: PromptTemplate) => {
    setPromptToEdit(prompt);
    setIsPromptModalOpen(true);
  };
  
  // --- Tool Handlers ---
  const handleSaveTool = (toolData: Omit<Tool, 'id'> & { id?: string }) => {
    if (toolData.id) { // Editing existing tool
      setTools(prev => prev.map(t => t.id === toolData.id ? { ...t, title: toolData.title, content: toolData.content } : t));
    } else { // Creating new tool
      setTools(prev => [...prev, { ...toolData, id: uuidv4(), content: toolData.content }]);
    }
  };

  const handleDeleteTool = (id: string) => {
    setTools(prev => prev.filter(t => t.id !== id));
  };

  const openNewToolModal = () => {
    setToolToEdit(null);
    setIsToolModalOpen(true);
  };

  const openEditToolModal = (tool: Tool) => {
    setToolToEdit(tool);
    setIsToolModalOpen(true);
  };

  const handleSaveKnowledgeBase = async (data: any) => {
    // Note: We are not actually sending the files in this step,
    // just the metadata. A real implementation would use FormData
    // and a different content-type.
    const payload = {
      kb_name: data.kbName,
      vector_store: data.vectorStore,
      allowed_file_types: data.allowedFileTypes,
      parsing_library: data.parsingLibrary,
      chunking_strategy: data.chunkingStrategy,
      chunk_size: data.chunkSize,
      chunk_overlap: data.chunkOverlap,
      metadata_strategy: data.metadataStrategy,
    };

    try {
      const response = await fetch('http://localhost:8000/kb/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('KB Creation Success:', result);
      // You could add a success notification here
    } catch (error) {
      console.error("Failed to create Knowledge Base:", error);
      // You could add an error notification here
    }
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  // --- Render ---

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <Sidebar
        isOpen={isSidebarOpen}
        chatSessions={filteredChatSessions}
        activeChatId={activeChatId}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      onNewChat={handleNewChat}
      onSelectChat={handleSelectChat}
      onDeleteChat={handleDeleteChat}
      onEditChat={handleEditChat}
      promptTemplates={promptTemplates}
      onNewPrompt={openNewPromptModal}
      onEditPrompt={openEditPromptModal}
      onDeletePrompt={handleDeletePrompt}
      onUsePrompt={handleUsePrompt}
      tools={tools}
      onNewTool={openNewToolModal}
      onEditTool={openEditToolModal}
      onDeleteTool={handleDeleteTool}
      onUseTool={() => { /* Define what using a tool does */ }}
      onNewKnowledgeBase={() => setIsKbModalOpen(true)}
      selectedKbs={selectedKbs}
      dbConnections={dbConnections}
      onNewDbConnection={openNewDbModal}
      onEditDbConnection={openEditDbModal}
      onDeleteDbConnection={handleDeleteDbConnection}
      selectedDbs={selectedDbs}
      setSelectedDbs={setSelectedDbs}
      onConnectDb={() => { /* Define what connecting to a DB does */ }}
      onOpenModelModal={() => setIsModelModalOpen(true)}
      setSidebarWidth={setSidebarWidth}
      setSelectedKbs={setSelectedKbs}
      />
      <div style={{ marginLeft: isSidebarOpen ? sidebarWidth : 0 }} className="flex-1 flex flex-col transition-all duration-300">
        <ChatView
          messages={activeChat?.messages ?? []}
          isTyping={isTyping}
          selectedKbs={selectedKbs}
        input={input}
        setInput={setInput}
        handleSendMessage={handleSendMessage}
        inputRef={inputRef}
        chatEndRef={chatEndRef}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        handleClearChat={handleClearChat}
        handleKeyPress={handleKeyPress}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        openSettingsModal={() => setIsSettingsModalOpen(true)}
        chatbotTitle={chatbotTitle}
        logo={logo}
        isSidebarOpen={isSidebarOpen}
      />
      </div>
      <PromptModal
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        onSave={handleSavePrompt}
        promptToEdit={promptToEdit}
      />
      <ToolModal
        isOpen={isToolModalOpen}
        onClose={() => setIsToolModalOpen(false)}
        onSave={handleSaveTool}
        toolToEdit={toolToEdit}
      />
      <ChatSessionModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        onSave={handleSaveChat}
        sessionToEdit={chatToEdit}
      />
      <DatabaseModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        onSave={handleSaveDbConnection}
        connectionToEdit={dbConnectionToEdit}
      />
      <ModelSelectionModal
        isOpen={isModelModalOpen}
        onClose={() => setIsModelModalOpen(false)}
        onSave={handleSaveModelSelection}
        currentModel={currentModel}
        apiKeys={apiKeys}
        modelSettings={modelSettings}
      />
      <KnowledgeBaseModal
        isOpen={isKbModalOpen}
        onClose={() => setIsKbModalOpen(false)}
        onSave={handleSaveKnowledgeBase}
        themeColor={themeColor}
      />
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        themeColor={themeColor}
        setThemeColor={setThemeColor}
        chatbotTitle={chatbotTitle}
        setChatbotTitle={setChatbotTitle}
        logo={logo}
        setLogo={setLogo}
      />
    </div>
  );
};

export default App;
