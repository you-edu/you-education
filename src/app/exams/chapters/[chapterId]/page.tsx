"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import MindMap from "@/components/Mindmap";
import VideoPlayer from "@/components/VideoPlayer";
import ChatUI from "@/components/ChatUI";
import NotesViewer from "@/components/NotesViewer";

const ChapterPage: React.FC = () => {
  const params = useParams();
  const chapterId = params.chapterId as string;

  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [mindMapData, setMindMapData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Use useCallback to prevent recreating the function on each render
  const handleLeafClick = useCallback(
    (selection: any) => {
      console.log("Leaf node clicked:", selection);
      
      // Reset both states when a new node is clicked
      setSelectedVideo(null);
      setSelectedNote(null);
      
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
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading mind map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[50vh]">
        <div className="text-center bg-red-50 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700">{error}</p>
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
    <div className="container mx-auto px-4 py-2 min-h-screen flex flex-col">
      <div className="flex flex-col md:flex-row gap-4 flex-grow">
        {(selectedVideo || selectedNote) && (
          <div className="w-full md:w-1/4">
            <div className="sticky top-4">
              {selectedVideo && (
                <>
                  <VideoPlayer url={selectedVideo} />
                  <div className="mt-4">
                    <ChatUI
                      source={{
                        type: "youtube",
                        content: selectedVideo,
                        videoId:
                          selectedVideo?.includes("youtube.com")
                            ? new URL(selectedVideo).searchParams.get("v") || ""
                            : selectedVideo?.split("/").pop() || "",
                      }}
                    />
                  </div>
                </>
              )}
              
              {selectedNote && (
                <NotesViewer noteId={selectedNote} />
              )}
            </div>
          </div>
        )}
        <div
          className={`w-full ${
            selectedVideo || selectedNote ? "md:w-3/4" : "md:w-full"
          } flex-grow`}
        >
          <div className="h-full">
            {mindMapData ? (
              <MemoizedMindMap
                data={mindMapData}
                onLeafClick={handleLeafClick}
              />
            ) : (
              <div className="p-4 bg-yellow-50 rounded-lg shadow">
                <p className="text-yellow-700">
                  No mind map data available for this chapter.
                </p>
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


