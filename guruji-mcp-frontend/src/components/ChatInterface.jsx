import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiUser, FiCpu } from 'react-icons/fi';

const ChatInterface = ({ systemPrompt, selectedTools, uploadedFiles }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m Guruji, your AI assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: getBotResponse(inputMessage, selectedTools, uploadedFiles),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const getBotResponse = (message, tools, files) => {
    const responses = [
      `I understand you're asking about "${message}". With tools like ${tools.join(', ')} and ${files.length} uploaded files, I can help you with that.`,
      `Great question! Based on your system configuration and the ${tools.length} tools you've selected, here's what I can do...`,
      `I've analyzed your request regarding "${message}" and can provide insights using ${tools.join(', ')}.`,
      `Thanks for your message! I'm Guruji, your intelligent assistant. I see you have ${files.length} files uploaded and are using ${tools.length} tools.`,
      `Interesting! Let me help you with "${message}" using the powerful tools at our disposal.`
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.type}`}>
            <div className="message-header">
              {message.type === 'user' ? (
                <><FiUser style={{ marginRight: '5px' }} /> You</>
              ) : (
                <><FiCpu style={{ marginRight: '5px' }} /> Guruji</>
              )}
            </div>
            <div className="message-content">{message.content}</div>
          </div>
        ))}

        {isTyping && (
          <div className="message bot">
            <div className="message-header"><FiCpu style={{ marginRight: '5px' }} /> Guruji</div>
            <div className="message-content">
              <div className="loading-dots">
                <span>●</span>
                <span>●</span>
                <span>●</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <form className="chat-input-form" onSubmit={handleSendMessage}>
          <input
            type="text"
            className="chat-input"
            placeholder="Ask Guruji anything..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
          />
          <button type="submit" className="send-button">
            <FiSend />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
