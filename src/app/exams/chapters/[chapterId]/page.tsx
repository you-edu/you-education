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
    <div className="h-[calc(100vh-var(--navbar-height))] flex flex-col overflow-hidden">
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Left panel for video/notes - 40% width */}
        {(selectedVideo || selectedNote) && (
          <div className="w-full md:w-[40%] overflow-y-auto border-r border-gray-200 dark:border-zinc-700">
            <div className="h-full p-2">
              {selectedVideo && (
                <VideoPlayer url={selectedVideo} />
              )}
              
              {selectedNote && (
                <NotesViewer noteId={selectedNote} />
              )}
            </div>
          </div>
        )}

        {/* Right panel for mindmap/chat with custom tabs - 60% width */}
        <div
          className={`w-full ${
            selectedVideo || selectedNote ? "md:w-[60%]" : "md:w-full"
          } flex-1 overflow-hidden flex flex-col`}
        >
          {/* Custom tab navigation */}
          <div className="px-4 pt-4 border-b border-gray-200 dark:border-zinc-700">
            <div className="inline-flex h-10 items-center justify-center rounded-md bg-gray-100 dark:bg-zinc-800/80 p-1 text-gray-500 dark:text-zinc-400">
              <button
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 ${
                  activeTab === "mindmap"
                    ? "bg-white dark:bg-zinc-900 text-gray-950 dark:text-zinc-50 shadow-sm"
                    : "hover:bg-gray-200/50 dark:hover:bg-zinc-700/50"
                }`}
                onClick={() => setActiveTab("mindmap")}
              >
                Mind Map
              </button>
              <button
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 ${
                  activeTab === "chat"
                    ? "bg-white dark:bg-zinc-900 text-gray-950 dark:text-zinc-50 shadow-sm"
                    : "hover:bg-gray-200/50 dark:hover:bg-zinc-700/50"
                }`}
                onClick={() => setActiveTab("chat")}
              >
                Chat
              </button>
            </div>
          </div>

          {/* Content area with both components always rendered but one hidden */}
          <div className="flex-1 relative overflow-hidden">
            {/* MindMap content - always rendered but conditionally visible */}
            <div 
              className={`absolute inset-0 transition-opacity duration-200 ${
                activeTab === "mindmap" 
                  ? "opacity-100 z-10" 
                  : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {mindMapData && (
                <MemoizedMindMap
                  data={mindMapData}
                  onLeafClick={handleLeafClick}
                />
              )}
            </div>

            {/* Chat content - always rendered but conditionally visible */}
            <div 
              className={`absolute inset-0 p-4 transition-opacity duration-200 ${
                activeTab === "chat" 
                  ? "opacity-100 z-10" 
                  : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {selectedVideo && (
                <ChatUI
                  source={{
                    type: "youtube",
                    content: selectedVideo,
                    videoId:
                      selectedVideo?.includes("youtube.com")
                        ? new URL(selectedVideo).searchParams.get("v") || ""
                        : selectedVideo?.split("/").pop() || "",
                    contentTitle: currentSelection?.title || "Educational Video"
                  }}
                />
              )}
              {selectedNote && noteData && (
                <ChatUI
                  source={{
                    type: "markdown",
                    content: noteData.content || "No content available",
                    contentTitle: currentSelection?.title || noteData.title || "Study Notes"
                  }}
                />
              )}
              {!selectedVideo && !selectedNote && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center p-6 max-w-md bg-white/80 dark:bg-zinc-800/80 rounded-lg shadow-lg border border-gray-200 dark:border-zinc-700">
                    <h3 className="text-lg font-medium text-gray-700 dark:text-zinc-300 mb-2">No content selected</h3>
                    <p className="text-gray-600 dark:text-zinc-400">
                      Select a topic from the mind map to view and chat about its content.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Create a memoized version of the MindMap component
const MemoizedMindMap = React.memo(MindMap);

export default ChapterPage;


