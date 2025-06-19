import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import "../styles/chatUI.css";
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
    contentTitle?: string;
  };
}

const ChatUI: React.FC<ChatUIProps> = ({ source = { type: 'markdown', content: '' } }) => {
  const [messages, setMessages] = useState<any[]>([
    {
      message: "Hello, how can I help you with this content?",
      sender: "bot"
    }
  ]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isLoading, setIsLoading] = useState(false);
  const [windowSize, setWindowSize] = useState(2); // Default 2 minutes before and after
  const [transcript, setTranscript] = useState("");
  const [isTranscriptFetching, setIsTranscriptFetching] = useState(false);
  const [customTimeRange, setCustomTimeRange] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const lastFetchedPosition = useRef(0);
  const { currentPosition } = useVideoPlayer();
  
  // For manually setting transcript time range
  const [manualStartTime, setManualStartTime] = useState(0);
  const [manualEndTime, setManualEndTime] = useState(5 * 60); // 5 minutes by default
  const [showTimeRange, setShowTimeRange] = useState(false);

  // Check theme on mount and when it changes
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

  // Initialize time range based on current video position when component mounts
  useEffect(() => {
    if (source?.type === 'youtube' && currentPosition?.playedSeconds > 0) {
      const currentTime = currentPosition.playedSeconds;
      setManualStartTime(Math.max(0, currentTime - (2 * 60)));
      setManualEndTime(currentTime + (2 * 60));
    }
  }, [source?.type, currentPosition?.playedSeconds]);

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
        setTranscript(data.transcript);
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

      // Call the API to get a response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: lastTwoMessages,
          context: context,
          sourceType: source?.type || 'markdown',
          contentTitle: source?.contentTitle || ''
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

  const setCurrentContextWindow = () => {
    if (currentPosition?.playedSeconds) {
      const currentTime = currentPosition.playedSeconds;
      setManualStartTime(Math.max(0, currentTime - (2 * 60)));
      setManualEndTime(currentTime + (2 * 60));
      setCustomTimeRange(true);
      fetchTranscript(true);
    }
  };

  return (
    <div className={`chat-ui-container ${theme}`} style={{ position: "relative", height: "100%", width: "100%" }}>
      {source?.type === 'youtube' && (
        <div className="time-range-toggle-container">
          <button 
            className="toggle-button"
            onClick={() => setShowTimeRange(!showTimeRange)}
          >
            {showTimeRange ? 'Hide Range' : 'Set Range'} {showTimeRange ? '▲' : '▼'}
          </button>
          
          {showTimeRange && (
            <div className="time-range-control compact">
              <div className="slider-container">
                <Slider
                  range
                  min={0}
                  max={currentPosition?.duration || 600}
                  value={[manualStartTime, manualEndTime]}
                  onChange={(value: number | number[]) => {
                    if (Array.isArray(value) && value.length === 2) {
                      const [start, end] = value;
                      const maxEnd = Math.min(start + 300, currentPosition?.duration || 600);
                      setManualStartTime(start);
                      setManualEndTime(end > maxEnd ? maxEnd : end);
                    }
                  }}
                  trackStyle={{ backgroundColor: '#3b82f6', height: 4 }}
                  railStyle={{ backgroundColor: 'var(--cs-container-border)', height: 4 }}
                  handleStyle={[
                    { backgroundColor: '#3b82f6', borderColor: '#fff', height: 14, width: 14, marginTop: -5 },
                    { backgroundColor: '#3b82f6', borderColor: '#fff', height: 14, width: 14, marginTop: -5 }
                  ]}
                />
                
                <div className="slider-labels">
                  <span>{formatTime(manualStartTime)}</span>
                  <span>{formatTime(manualEndTime)}</span>
                </div>
                
                <div className="time-range-values">
                  <span>{((manualEndTime - manualStartTime) / 60).toFixed(1)} min</span>
                  <button 
                    className="range-button-small"
                    onClick={setCurrentContextWindow}
                  >
                    Current ±2min
                  </button>
                  <button 
                    className="range-button-small primary"
                    onClick={fetchCustomRangeTranscript}
                    disabled={isTranscriptFetching}
                  >
                    {isTranscriptFetching ? '⏳' : 'Apply'}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {customTimeRange && (
            <div className="range-status-small">
              Context: <span className="time-display">{formatTime(startTime)}</span> - <span className="time-display">{formatTime(endTime)}</span>
              {isTranscriptFetching && <div className="loading-indicator-small"></div>}
            </div>
          )}
        </div>
      )}

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
            {isLoading && <TypingIndicator content="AI is thinking..." />}
          </MessageList>
          <MessageInput 
            placeholder="Ask a question about the content..." 
            onSend={handleSend}
            attachButton={false}
          />
        </ChatContainer>
      </MainContainer>
    </div>
  );
};

export default ChatUI;
