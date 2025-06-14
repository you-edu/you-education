import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator
} from "@chatscope/chat-ui-kit-react";
import React, { useState, useEffect } from "react";

const ChatUI: React.FC = () => {
  const [messages, setMessages] = useState<any[]>(
    [
      {
        message: "Hello, how can I help you?",
        sender: "bot"
      }
    ]
  );
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const checkTheme = () => {
      const isDark = 
        document.documentElement.classList.contains('dark') || 
        document.documentElement.getAttribute('data-theme') === 'dark' ||
        document.body.classList.contains('dark-theme') ||
        document.body.dataset.theme === 'dark';
      
      setTheme(isDark ? 'dark' : 'light');
    };
    
    checkTheme();
    
    const observer = new MutationObserver(checkTheme);
    
    observer.observe(document.documentElement, { 
      attributes: true,
      attributeFilter: ['class', 'data-theme']
    });
    
    observer.observe(document.body, { 
      attributes: true,
      attributeFilter: ['class', 'data-theme']
    });
    
    return () => {
      observer.disconnect();
    };
  }, []);

  const handleSend = (message: string) => {
    const newMessages = [...messages, { message, sender: "user" }];
    setMessages([...newMessages, { message: `You said: ${message}`, sender: "bot" }]);
  };

  return (
    <div className={`chat-ui-container ${theme}`} style={{ position: "relative", height: "100%", width: "100%" }}>
      <style jsx>{`
        .chat-ui-container {
          --cs-message-primary-bg: #eff6ff;
          --cs-message-secondary-bg: #dbeafe;
          --cs-message-primary-fg: #1e3a8a;
          --cs-message-secondary-fg: #1e40af;
          --cs-input-bg: #ffffff;
          --cs-input-border: #e5e7eb;
          --cs-main-bg: #f9fafb;
          --cs-container-border: #e5e7eb;
        }

        .chat-ui-container.dark {
          --cs-message-primary-bg: #1f2937;
          --cs-message-secondary-bg: #374151;
          --cs-message-primary-fg: #e5e7eb;
          --cs-message-secondary-fg: #d1d5db;
          --cs-input-bg: #111827;
          --cs-input-border: #374151;
          --cs-main-bg: #0f172a;
          --cs-container-border: #1f2937;
        }

        /* Override default chat UI kit styles */
        :global(.chat-ui-container .cs-message-list) {
          background-color: var(--cs-main-bg);
        }

        :global(.chat-ui-container .cs-message__content) {
          background-color: var(--cs-message-primary-bg);
          color: var(--cs-message-primary-fg);
        }

        :global(.chat-ui-container .cs-message--outgoing .cs-message__content) {
          background-color: var(--cs-message-secondary-bg);
          color: var(--cs-message-secondary-fg);
        }

        :global(.chat-ui-container .cs-chat-container) {
          border: 1px solid var(--cs-container-border);
          border-radius: 8px;
          overflow: hidden;
        }

        :global(.chat-ui-container .cs-message-input) {
          background-color: var(--cs-input-bg);
          border-top: 1px solid var(--cs-input-border);
        }

        :global(.chat-ui-container .cs-message-input__content-editor) {
          background-color: var(--cs-input-bg);
          color: var(--cs-message-primary-fg);
        }

        :global(.chat-ui-container .cs-message-input__content-editor-wrapper) {
          background-color: var(--cs-input-bg);
        }
        
        :global(.chat-ui-container .cs-button) {
          color: var(--cs-message-secondary-fg);
          filter: brightness(1.2);
        }

        :global(.chat-ui-container.dark .cs-message-input__content-editor[data-placeholder]:empty:before) {
          color: #6b7280;
        }
      `}</style>

      <MainContainer style={{ height: "100%" }}>
        <ChatContainer style={{ height: "100%" }}>
          <MessageList>
            {messages.map((msg, i) => (
              <Message 
                key={i} 
                model={{ 
                  message: msg.message, 
                  sentTime: "now", 
                  sender: msg.sender, 
                  direction: msg.sender === "user" ? "outgoing" : "incoming",
                  position: "normal"
                }} 
              />
            ))}
          </MessageList>
          <MessageInput placeholder="Type message here" onSend={handleSend} />
        </ChatContainer>
      </MainContainer>
    </div>
  );
};

export default ChatUI;
