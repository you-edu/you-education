import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator
} from "@chatscope/chat-ui-kit-react";
import React, { useState, useEffect, useRef } from "react";
import { useVideoPlayer } from '@/context/VideoPlayerContext';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

interface ChatUIProps {
  source: {
    type: 'youtube' | 'markdown';
    content: string; // YouTube URL or markdown text
    videoId?: string;
  };
}

const ChatUI: React.FC<ChatUIProps> = ({ source = { type: 'markdown', content: '' } }) => {
  const [messages, setMessages] = useState<any[]>(
    [
      {
        message: "Hello, how can I help you with this content?",
        sender: "bot"
      }
    ]
  );
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isLoading, setIsLoading] = useState(false);
  const [windowSize, setWindowSize] = useState(2); // Default 2 minutes before and after
  const [transcript, setTranscript] = useState("");
  const [isTranscriptVisible, setIsTranscriptVisible] = useState(false);
  const [isTranscriptFetching, setIsTranscriptFetching] = useState(false);
  const [customTimeRange, setCustomTimeRange] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const lastFetchedPosition = useRef(0);
  const { currentPosition } = useVideoPlayer();
  
  // For manually setting transcript time range
  const [manualStartTime, setManualStartTime] = useState(0);
  const [manualEndTime, setManualEndTime] = useState(5 * 60); // 5 minutes by default

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

  // Fetch transcript when using YouTube mode and position changes
  useEffect(() => {
    // Check if source exists and is YouTube type
    if (source?.type === 'youtube' && source?.videoId && currentPosition?.playedSeconds > 0) {
      // Only fetch if position changed significantly (more than 30 seconds)
      // or if it's the first fetch
      if (
        Math.abs(currentPosition?.playedSeconds - lastFetchedPosition.current) > 30 ||
        lastFetchedPosition.current === 0
      ) {
        lastFetchedPosition.current = currentPosition?.playedSeconds || 0;
        
        if (!customTimeRange) {
          fetchTranscript();
        }
      }
    }
  }, [currentPosition?.playedSeconds, source?.type, source?.videoId, windowSize, customTimeRange]);

  const fetchTranscript = async (useCustomRange = false) => {
    if (!source?.videoId) {
      console.log("No video ID available, skipping transcript fetch");
      return;
    }
    
    try {
      setIsTranscriptFetching(true);
      
      let fetchStart, fetchEnd;
      
      if (useCustomRange) {
        fetchStart = manualStartTime;
        fetchEnd = manualEndTime;
      } else {
        // Make sure we have a valid position
        if (!currentPosition || typeof currentPosition.playedSeconds !== 'number') {
          console.warn("Invalid or missing currentPosition, using default values");
          fetchStart = 0;
          fetchEnd = 300; // Default to first 5 minutes
        } else {
          fetchStart = Math.max(0, currentPosition.playedSeconds - (windowSize * 60));
          fetchEnd = currentPosition.playedSeconds + (windowSize * 60);
        }
      }
      
      // Store the times for reference
      setStartTime(fetchStart);
      setEndTime(fetchEnd);
      
      console.log(`Fetching transcript for video ${source.videoId} from ${formatTime(fetchStart)} to ${formatTime(fetchEnd)}`);
      const res = await fetch(`/api/transcript?videoId=${source.videoId}&start=${fetchStart}&end=${fetchEnd}`);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch transcript: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      
      if (data.transcript) {
        console.log(`Received transcript with length: ${data.transcript.length} characters`);
        console.log(`Transcript preview: ${data.transcript.substring(0, 100)}...`);
        setTranscript(data.transcript);
        setIsTranscriptVisible(true);
      } else {
        console.warn("Received empty transcript");
        setTranscript("No transcript available for this section of the video.");
      }
    } catch (error) {
      console.error("Error fetching transcript:", error);
      setTranscript("Failed to load transcript. Please try again later.");
    } finally {
      setIsTranscriptFetching(false);
    }
  };

  const fetchCustomRangeTranscript = () => {
    setCustomTimeRange(true);
    fetchTranscript(true);
  };

  const resetToAutoRange = () => {
    setCustomTimeRange(false);
    fetchTranscript(false);
  };

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSend = async (message: string) => {
    try {
      setIsLoading(true);
      
      // Add user message to the chat
      const newMessages = [...messages, { message, sender: "user" }];
      setMessages(newMessages);

      // Get the last two messages for context
      const lastTwoMessages = newMessages.slice(-3);
      
      // Prepare context based on source type
      let context = '';
      if (source?.type === 'youtube') {
        // For YouTube, use the transcript window around current position
        context = transcript;
        
        console.log("Using transcript context:", {
          timeRange: `${formatTime(startTime)} - ${formatTime(endTime)}`,
          transcriptLength: context.length,
          customRange: customTimeRange
        });
        
        if (!context || context.length < 10) {
          setMessages([...newMessages, { 
            message: "I don't have any transcript context for this part of the video. Please wait while I fetch the latest transcript.", 
            sender: "bot" 
          }]);
          await fetchTranscript(customTimeRange);
          context = transcript;
        }
      } else {
        // For markdown, use the entire content
        context = source?.content || '';
        console.log("Using markdown context, length:", context.length);
      }

      // Log what we're sending to the API
      console.log("Sending to API:", {
        messagesCount: lastTwoMessages.length,
        contextLength: context.length,
        contextPreview: context.substring(0, 100) + '...',
        sourceType: source?.type
      });

      // Call the API to get a response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: lastTwoMessages,
          context: context,
          sourceType: source?.type || 'markdown'
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get response: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      
      // Add bot response to chat
      setMessages([...newMessages, { 
        message: responseData.reply, 
        sender: "bot" 
      }]);
    } catch (error) {
      console.error("Error in chat:", error);
      setMessages([...messages, { message, sender: "user" }, { 
        message: "Sorry, I encountered an error while processing your request.", 
        sender: "bot" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputFocus = () => {
    if (source?.type === 'youtube' && currentPosition?.playedSeconds) {
      const time = formatTime(currentPosition.playedSeconds);
      console.log(`Chat input focused at video time: ${time} (${Math.floor(currentPosition.playedSeconds)} seconds)`);
    }
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

        .transcript-indicator {
          padding: 10px;
          margin-bottom: 10px;
          border-radius: 4px;
          background-color: var(--cs-message-secondary-bg);
          color: var(--cs-message-secondary-fg);
          font-size: 0.8rem;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .window-control {
          padding: 10px;
          margin-bottom: 10px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .transcript-preview {
          padding: 12px;
          margin: 8px 0;
          max-height: 200px;
          overflow-y: auto;
          border-radius: 4px;
          background-color: var(--cs-main-bg);
          border: 1px solid var(--cs-container-border);
          font-size: 0.9rem;
          line-height: 1.5;
          white-space: pre-wrap;
        }
        
        .toggle-button {
          background-color: var(--cs-message-secondary-bg);
          border: none;
          border-radius: 4px;
          padding: 4px 8px;
          color: var(--cs-message-secondary-fg);
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: bold;
        }
        
        .toggle-button:hover {
          opacity: 0.9;
        }
        
        .loading-indicator {
          display: inline-block;
          margin-left: 8px;
          width: 12px;
          height: 12px;
          border: 2px solid rgba(0, 0, 0, 0.1);
          border-top-color: var(--cs-message-secondary-fg);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .range-controls {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 12px;
          padding: 10px;
          border-radius: 4px;
          background-color: var(--cs-main-bg);
          border: 1px solid var(--cs-container-border);
        }
        
        .time-inputs {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        
        .time-input {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .time-input input {
          padding: 6px 8px;
          border-radius: 4px;
          border: 1px solid var(--cs-container-border);
          background-color: var(--cs-input-bg);
          color: var(--cs-message-primary-fg);
          width: 80px;
        }
        
        .range-buttons {
          display: flex;
          gap: 10px;
          margin-top: 8px;
        }
        
        .range-button {
          padding: 8px 12px;
          border-radius: 4px;
          border: none;
          background-color: var(--cs-message-secondary-bg);
          color: var(--cs-message-secondary-fg);
          cursor: pointer;
          font-weight: bold;
        }
        
        .range-button:hover {
          opacity: 0.9;
        }
        
        .range-status {
          font-size: 0.8rem;
          color: var(--cs-message-primary-fg);
          margin-top: 8px;
          padding: 4px 8px;
          background-color: var(--cs-message-primary-bg);
          border-radius: 4px;
          opacity: 0.8;
        }
      `}</style>

      <MainContainer style={{ height: "100%" }}>
        <ChatContainer style={{ height: "100%" }}>
          {source?.type === 'youtube' && (
            <div className="window-control">
              {!customTimeRange ? (
                <>
                  <p>Auto context window: {windowSize} minutes before and after current position</p>
                  <Slider 
                    min={1}
                    max={2.5}
                    step={0.5}
                    value={windowSize}
                    onChange={(value) => setWindowSize(value as number)}
                  />
                </>
              ) : (
                <div className="range-status">
                  Using custom time range: {formatTime(manualStartTime)} - {formatTime(manualEndTime)}
                  <button 
                    className="range-button" 
                    style={{ marginLeft: '10px', padding: '2px 6px' }}
                    onClick={resetToAutoRange}
                  >
                    Reset to Auto
                  </button>
                </div>
              )}
              
              <div 
                className="transcript-indicator"
                onClick={() => setIsTranscriptVisible(!isTranscriptVisible)}
              >
                <span>
                  {customTimeRange ? 
                    `Using custom range: ${formatTime(startTime)} to ${formatTime(endTime)}` : 
                    `Using context from video at ${formatTime(currentPosition?.playedSeconds || 0)}`
                  }
                  {isTranscriptFetching && <span className="loading-indicator"></span>}
                </span>
                <button className="toggle-button">
                  {isTranscriptVisible ? 'Hide Transcript' : 'Show Transcript'}
                </button>
              </div>
              
              {isTranscriptVisible && (
                <div className="range-controls">
                  <h4>Custom Transcript Range</h4>
                  <div className="time-inputs">
                    <div className="time-input">
                      <label>Start time (seconds):</label>
                      <input 
                        type="number" 
                        value={manualStartTime}
                        min="0"
                        onChange={(e) => setManualStartTime(Math.max(0, parseInt(e.target.value) || 0))}
                      />
                    </div>
                    <div className="time-input">
                      <label>End time (seconds):</label>
                      <input 
                        type="number"
                        value={manualEndTime}
                        min={manualStartTime + 60}
                        max={manualStartTime + 300} // Max 5 min window
                        onChange={(e) => setManualEndTime(Math.min(
                          manualStartTime + 300, 
                          Math.max(manualStartTime + 60, parseInt(e.target.value) || 0)
                        ))}
                      />
                    </div>
                  </div>
                  
                  <div className="range-buttons">
                    <button 
                      className="range-button"
                      onClick={fetchCustomRangeTranscript}
                      disabled={isTranscriptFetching}
                    >
                      Fetch Custom Range
                    </button>
                    
                    <button 
                      className="range-button"
                      onClick={() => {
                        setManualStartTime(Math.max(0, (currentPosition?.playedSeconds || 0) - 60));
                        setManualEndTime((currentPosition?.playedSeconds || 0) + 240);
                      }}
                    >
                      Set From Current Position
                    </button>
                  </div>
                </div>
              )}
              
              {isTranscriptVisible && transcript && (
                <div className="transcript-preview">
                  {transcript}
                </div>
              )}
            </div>
          )}
          
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
            {isLoading && <TypingIndicator content="AI is thinking..." />}
          </MessageList>
          <MessageInput 
            placeholder="Ask a question about the content..." 
            onSend={handleSend} 
            onFocus={handleInputFocus}
          />
        </ChatContainer>
      </MainContainer>
    </div>
  );
};

export default ChatUI;
