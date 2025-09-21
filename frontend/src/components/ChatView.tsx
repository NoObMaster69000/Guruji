import React, { FormEvent, KeyboardEvent } from 'react';
import { Send, Bot, User, Sun, Moon, Trash2, Settings } from 'lucide-react';
import { HamburgerButton } from './HamburgerButton';
import { WelcomeScreen } from './WelcomeScreen';

// --- Type Definitions ---
export type Message = {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
};

// --- Props Interface ---
interface ChatViewProps {
  messages: Message[];
  isTyping: boolean;
  input: string;
  setInput: (value: string) => void;
  handleSendMessage: (e: FormEvent) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  chatEndRef: React.RefObject<HTMLDivElement>;
  selectedKbs: string[];
  darkMode: boolean;
  toggleDarkMode: () => void;
  handleClearChat: () => void;
  handleKeyPress: (e: KeyboardEvent<HTMLInputElement>) => void;
  toggleSidebar: () => void;
  chatbotTitle: string;
  logo: string | null;
  openSettingsModal: () => void;
  isSidebarOpen: boolean;
  userName: string | null;
}

// =================================================================================
// --- ChatView Component ---
// =================================================================================
export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  isTyping,
  input,
  setInput,
  handleSendMessage,
  inputRef,
  chatEndRef,
  darkMode,
  toggleDarkMode,
  handleClearChat,
  handleKeyPress,
  toggleSidebar,
  chatbotTitle,
  logo,
  openSettingsModal,
  isSidebarOpen,
  userName,
}) => {
  // The selectedKbs prop is now available but not used in this component directly.
  return (
    <div className="flex flex-col h-screen flex-1">
      <Header
        toggleDarkMode={toggleDarkMode}
        chatbotTitle={chatbotTitle}
        logo={logo}
        darkMode={darkMode}
        handleClearChat={handleClearChat}
        toggleSidebar={toggleSidebar}
        openSettingsModal={openSettingsModal}
        isSidebarOpen={isSidebarOpen}
      />
      <ChatArea
        messages={messages}
        isTyping={isTyping}
        chatEndRef={chatEndRef}
        userName={userName}
      />
      <InputBar
        input={input}
        setInput={setInput}
        handleSendMessage={handleSendMessage}
        handleKeyPress={handleKeyPress}
        inputRef={inputRef}
      />
    </div>
  );
};

// Header Component
// =================================================================================

type HeaderProps = {
  toggleDarkMode: () => void;
  darkMode: boolean;
  handleClearChat: () => void;
  toggleSidebar: () => void;
  chatbotTitle: string;
  logo: string | null;
  openSettingsModal: () => void;
  isSidebarOpen: boolean;
};

const Header: React.FC<HeaderProps> = ({ toggleDarkMode, darkMode, handleClearChat, toggleSidebar, chatbotTitle, logo, openSettingsModal, isSidebarOpen }) => (
  <header className="relative z-30 flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-md">
    <div className="flex items-center gap-4">
      <HamburgerButton isOpen={isSidebarOpen} onClick={toggleSidebar} className="text-gray-500 dark:text-gray-400" />
      {logo && <img src={logo} alt="logo" className="h-8 w-auto rounded-md" />}
      <h1 className="text-xl font-bold text-gray-800 dark:text-white">{chatbotTitle}</h1>
    </div>
    <div className="flex items-center space-x-4">
      <button onClick={handleClearChat} aria-label="Clear chat" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
        <Trash2 size={20} />
      </button>
      <button onClick={toggleDarkMode} aria-label="Toggle dark mode" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>
      <button onClick={openSettingsModal} aria-label="Open settings" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
        <Settings size={20} />
      </button>
    </div>
  </header>
);

// ChatArea Component
// =================================================================================

type ChatAreaProps = {
  messages: Message[];
  isTyping: boolean;
  chatEndRef: React.RefObject<HTMLDivElement>;
  userName: string | null;
};

const ChatArea: React.FC<ChatAreaProps> = ({ messages, isTyping, chatEndRef, userName }) => (
  <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100 dark:bg-gray-900">
    {messages.length === 0 ? (
      <WelcomeScreen userName={userName} />
    ) : (
      messages.map((msg) => (
        <MessageBubble key={msg.id} {...msg} />
      ))
    )}
    {isTyping && <TypingIndicator />}
    <div ref={chatEndRef} />
  </main>
);

// MessageBubble Component
// =================================================================================

const MessageBubble: React.FC<Message> = ({ text, sender, timestamp }) => {
  const isUser = sender === 'user';
  return (
    <div className={`flex items-start gap-3 animate-fade-in ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && <Avatar icon={<Bot size={24} />} />}
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-2">
           <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{isUser ? 'You' : 'Assistant'}</span>
        </div>
        <div className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-2xl ${isUser ? 'bg-[--theme-color] text-white rounded-br-none' : 'bg-white dark:bg-gray-700 dark:text-gray-200 rounded-bl-none'}`}>
          <p>{text}</p>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{timestamp}</span>
      </div>
       {isUser && <Avatar icon={<User size={24} />} />}
    </div>
  );
};


// Avatar Component
// =================================================================================

type AvatarProps = {
  icon: React.ReactNode;
};

const Avatar: React.FC<AvatarProps> = ({ icon }) => (
  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300">
    {icon}
  </div>
);

// TypingIndicator Component
// =================================================================================

const TypingIndicator: React.FC = () => (
  <div className="flex items-start gap-3 animate-fade-in">
    <Avatar icon={<Bot size={24} />} />
    <div className="p-3 rounded-2xl bg-white dark:bg-gray-700 dark:text-gray-200 rounded-bl-none">
      <div className="flex items-center space-x-1">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce-short"></span>
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce-short delay-150"></span>
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce-short delay-300"></span>
      </div>
    </div>
  </div>
);

// InputBar Component
// =================================================================================

type InputBarProps = {
  input: string;
  setInput: (value: string) => void;
  handleSendMessage: (e: FormEvent) => void;
  handleKeyPress: (e: KeyboardEvent<HTMLInputElement>) => void;
  inputRef: React.RefObject<HTMLInputElement>;
};

const InputBar: React.FC<InputBarProps> = ({ input, setInput, handleSendMessage, handleKeyPress, inputRef }) => (
  <footer className="p-4 bg-white dark:bg-gray-800 shadow-t">
    <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type a message..."
        aria-label="Chat input"
        className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      />
      <button
        type="submit"
        aria-label="Send message"
        className="p-2 bg-[--theme-color] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
        disabled={!input.trim()}
      >
        <Send size={20} />
      </button>
    </form>
  </footer>
);
