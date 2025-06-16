"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface VideoPlayerContextType {
  currentPosition: {
    played: number;
    playedSeconds: number;
  };
  updatePosition: (state: { played: number; playedSeconds: number }) => void;
}

const defaultContext: VideoPlayerContextType = {
  currentPosition: { played: 0, playedSeconds: 0 },
  updatePosition: () => {},
};

const VideoPlayerContext = createContext<VideoPlayerContextType>(defaultContext);

export const useVideoPlayer = () => useContext(VideoPlayerContext);

export const VideoPlayerProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [currentPosition, setCurrentPosition] = useState({ played: 0, playedSeconds: 0 });

  const updatePosition = (state: { played: number; playedSeconds: number }) => {
    setCurrentPosition(state);
  };

  return (
    <VideoPlayerContext.Provider value={{ currentPosition, updatePosition }}>
      {children}
    </VideoPlayerContext.Provider>
  );
};