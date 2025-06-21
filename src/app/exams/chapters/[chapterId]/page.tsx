"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import MindMap from "@/components/Mindmap";
import VideoPlayer from "@/components/VideoPlayer";
import ChatUI from "@/components/ChatUI";
import NotesViewer from "@/components/NotesViewer";

interface NoteData {
  _id: string;
  content: string;
  title?: string;
  createdAt?: string;
  updatedAt?: string;
}

const ChapterPage: React.FC = () => {
  const params = useParams();
  const chapterId = params.chapterId as string;

  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [noteData, setNoteData] = useState<NoteData | null>(null);
  const [mindMapData, setMindMapData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"mindmap" | "chat">("mindmap");
  const [currentSelection, setCurrentSelection] = useState<any>(null);

  // Fetch mind map data when the component mounts
  useEffect(() => {
    const fetchMindMap = async () => {
      if (!chapterId) {
        setError("Chapter ID not found");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log(`Fetching mind map for chapterId: ${chapterId}`);

        const response = await fetch(
          `/api/mind-maps?chapterId=${encodeURIComponent(chapterId)}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch mind map: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Mind map data received:", data);

        if (data && data.content) {
          setMindMapData(data.content);
        } else {
          setError("No mind map content found");
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching mind map:", err);
        setError("Failed to load mind map data. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchMindMap();
  }, [chapterId]);

  // Fetch note data when selectedNote changes
  useEffect(() => {
    if (!selectedNote) {
      setNoteData(null);
      return;
    }

    const fetchNote = async () => {
      try {
        console.log(`Fetching note with ID: ${selectedNote}`);
        const response = await fetch(`/api/notes/${selectedNote}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch note: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Note data received:', data);
        setNoteData(data);
      } catch (err) {
        console.error('Error fetching note:', err);
        setNoteData(null);
      }
    };

    fetchNote();
  }, [selectedNote]);

  // Use useCallback to prevent recreating the function on each render
  const handleLeafClick = useCallback(
    (selection: any) => {
      console.log("Leaf node clicked:", selection);
      
      // Store the full selection for title reference
      setCurrentSelection(selection);
      
      // Reset both states when a new node is clicked
      setSelectedVideo(null);
      setSelectedNote(null);
      setNoteData(null);
      
      if (
        selection &&
        selection.resource &&
        selection.resource.type === "md_notes" &&
        selection.resource.data &&
        selection.resource.data.id
      ) {
        // Handle notes type
        console.log("Setting selected note ID:", selection.resource.data.id);
        setSelectedNote(selection.resource.data.id);
      } else if (
        selection &&
        selection.resources &&
        selection.resources.length > 0
      ) {
        // Check if the first resource is a note
        const firstResource = selection.resources[0];
        if (firstResource.type === "md_notes" && firstResource.data && firstResource.data.id) {
          console.log("Setting selected note ID from resources array:", firstResource.data.id);
          setSelectedNote(firstResource.data.id);
        } else if (firstResource.data && firstResource.data.url) {
          // Handle video resource
          console.log("Setting selected video URL from resources array:", firstResource.data.url);
          setSelectedVideo(firstResource.data.url);
        }
      } else if (
        selection &&
        selection.resource &&
        selection.resource.data &&
        selection.resource.data.url
      ) {
        // Handle video resource
        console.log("Setting selected video URL:", selection.resource.data.url);
        setSelectedVideo(selection.resource.data.url);
      } else if (typeof selection === "string") {
        // Fallback for simpler implementations that just pass a URL string
        setSelectedVideo(selection);
      }
    },
    []
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-var(--navbar-height))]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading mind map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-var(--navbar-height))]">
        <div className="text-center bg-red-50 dark:bg-red-900/20 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Error</h2>
          <p className="text-gray-700 dark:text-gray-300">{error}</p>
          <p className="mt-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try Again
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-var(--navbar-height))] flex flex-col">
      <div className="flex flex-col md:flex-row h-full">
        {/* Left panel for video/notes - 40% width */}
        {(selectedVideo || selectedNote) && (
          <div className="w-full md:w-[40%] h-full">
            <div className="h-full p-2 flex flex-col">
              {selectedVideo && (
                <div className="h-full">
                  <VideoPlayer url={selectedVideo} />
                </div>
              )}
              
              {selectedNote && (
                <div className="h-full">
                  <NotesViewer noteId={selectedNote} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right panel for mindmap/chat with custom tabs - 60% width */}
        <div
          className={`w-full ${
            selectedVideo || selectedNote ? "md:w-[60%]" : "md:w-full"
          } h-full flex flex-col bg-white dark:bg-zinc-900`}
        >
          {/* Tab navigation */}
          <div className="border-b border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/90">
            <div className="flex">
              <button
                className={`px-5 py-3 text-sm font-medium transition-all relative
                  ${activeTab === "mindmap"
                    ? "text-gray-900 dark:text-white bg-white dark:bg-zinc-900"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                onClick={() => setActiveTab("mindmap")}
              >
                Mind Map
                {activeTab === "mindmap" && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black dark:bg-white"></div>
                )}
              </button>
              <button
                className={`px-5 py-3 text-sm font-medium transition-all relative
                  ${activeTab === "chat"
                    ? "text-gray-900 dark:text-white bg-white dark:bg-zinc-900"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                onClick={() => setActiveTab("chat")}
              >
                Chat
                {activeTab === "chat" && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black dark:bg-white"></div>
                )}
              </button>
            </div>
          </div>

          {/* Tab content area - make sure this takes up remaining height */}
          <div className="flex-1 relative">
            {activeTab === "mindmap" && mindMapData && (
              <div className="h-full">
                <MemoizedMindMap
                  data={mindMapData}
                  onLeafClick={handleLeafClick}
                />
              </div>
            )}
            
            {activeTab === "chat" && currentSelection && (
              <div className="h-full">
                <ChatUI
                  source={{
                    type: selectedVideo ? "youtube" : "markdown",
                    content: selectedVideo || (noteData ? noteData.content : ""),
                    contentTitle: currentSelection.title || "Selected Content"
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Create a memoized version of the MindMap component
const MemoizedMindMap = React.memo(MindMap);

export default ChapterPage;


