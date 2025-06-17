import React, { useEffect, useState } from 'react';
import { XMarkIcon, ArrowsPointingOutIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

interface NotesViewerProps {
  noteId: string;
}

interface NoteData {
  _id: string;
  content: string;
  title?: string;
  createdAt?: string;
  updatedAt?: string;
}

const NotesViewer: React.FC<NotesViewerProps> = ({ noteId }) => {
  const [note, setNote] = useState<NoteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log(`Fetching note with ID: ${noteId}`);
        const response = await fetch(`/api/notes/${noteId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch note: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Note data received:', data);
        setNote(data);
      } catch (err) {
        console.error('Error fetching note:', err);
        setError(err instanceof Error ? err.message : 'Failed to load note');
      } finally {
        setIsLoading(false);
      }
    };

    if (noteId) {
      fetchNote();
    }
  }, [noteId]);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [isFullScreen]);

  // Add/remove body scroll lock when fullscreen is toggled
  useEffect(() => {
    if (isFullScreen) {
      // Disable scrolling on the body when fullscreen is active
      document.body.style.overflow = 'hidden';
    } else {
      // Re-enable scrolling when exiting fullscreen
      document.body.style.overflow = '';
    }
    
    return () => {
      // Cleanup - ensure scrolling is re-enabled when component unmounts
      document.body.style.overflow = '';
    };
  }, [isFullScreen]);

  // Simple markdown to HTML converter for rendering notes
  const markdownToHtml = (markdown: string): string => {
    let html = markdown
      // Headers
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold my-4">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold my-3">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold my-2">$1</h3>')
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      // Lists
      .replace(/^\*\s(.*)$/gim, '<ul class="list-disc pl-5 my-2"><li>$1</li></ul>')
      .replace(/^-\s(.*)$/gim, '<ul class="list-disc pl-5 my-2"><li>$1</li></ul>')
      .replace(/^\d+\.\s(.*)$/gim, '<ol class="list-decimal pl-5 my-2"><li>$1</li></ol>')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 p-3 rounded my-3 overflow-auto text-xs"><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded text-xs">$1</code>')
      // Line breaks
      .replace(/\n/g, '<br>');
    
    // Fix nested lists problem (quick and dirty solution)
    html = html.replace(/<\/ul><br><ul class="list-disc pl-5 my-2">/g, '');
    html = html.replace(/<\/ol><br><ol class="list-decimal pl-5 my-2">/g, '');
    
    return html;
  };

  if (isLoading) {
    return (
      <div className="bg-zinc-800/80 rounded-lg p-4 border border-zinc-700 shadow-lg">
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
          <span className="ml-2 text-zinc-300">Loading note...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-zinc-800/80 rounded-lg p-4 border border-zinc-700 shadow-lg">
        <h3 className="text-lg font-medium text-red-400 mb-2">Error Loading Note</h3>
        <div className="text-zinc-300">
          <p>{error}</p>
          <p className="mt-2 text-sm">Note ID: {noteId}</p>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="bg-zinc-800/80 rounded-lg p-4 border border-zinc-700 shadow-lg">
        <h3 className="text-lg font-medium text-yellow-400 mb-2">Note Not Found</h3>
        <div className="text-zinc-300">
          <p>The requested note could not be found.</p>
          <p className="mt-2 text-sm">Note ID: {noteId}</p>
        </div>
      </div>
    );
  }

  // Full screen overlay component
  if (isFullScreen) {
    return (
      <>
        {/* Portal container for fullscreen view - ensures it renders at the root level */}
        <div 
          className="fixed inset-0 bg-zinc-900 overflow-y-auto"
          style={{ 
            zIndex: 99999, // Very high z-index to ensure it's on top of everything
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }}
        >
          <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-zinc-900 py-2 z-10">
              <div className="flex items-center">
                <button 
                  onClick={() => setIsFullScreen(false)}
                  className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white transition-colors"
                  aria-label="Back to normal view"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                  <span>Back</span>
                </button>
              </div>
              <button 
                onClick={() => setIsFullScreen(false)}
                className="p-2 rounded-full hover:bg-zinc-800 transition-colors"
                aria-label="Close full screen"
              >
                <XMarkIcon className="h-6 w-6 text-zinc-300" />
              </button>
            </div>
            
            <div className="text-zinc-300">
              <div className="prose prose-invert prose-headings:text-zinc-100 prose-a:text-blue-400 max-w-none">
                <div dangerouslySetInnerHTML={{ __html: markdownToHtml(note.content) }} />
              </div>
              
              {note.updatedAt && (
                <p className="mt-8 text-xs text-zinc-500">
                  Last updated: {new Date(note.updatedAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Regular view
  return (
    <div className="bg-zinc-800/80 rounded-lg p-4 border border-zinc-700 shadow-lg flex flex-col">
      <div className="flex justify-end items-center mb-2">
        <button 
          onClick={() => setIsFullScreen(true)}
          className="p-1 rounded hover:bg-zinc-700 transition-colors"
          aria-label="Full screen mode"
          title="View in full screen"
        >
          <ArrowsPointingOutIcon className="h-5 w-5 text-zinc-300" />
        </button>
      </div>
      
      <div className="text-zinc-300 flex flex-col">
        <div className="max-w-none overflow-y-auto h-96 markdown-content"> {/* Fixed height of 24rem (384px) */}
          <div 
            className="prose prose-invert prose-headings:text-zinc-100 prose-a:text-blue-400"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(note.content) }}
          />
        </div>

        {note.updatedAt && (
          <p className="mt-4 text-xs text-zinc-500">
            Last updated: {new Date(note.updatedAt).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default NotesViewer;
