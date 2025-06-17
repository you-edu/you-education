import React, { useEffect, useState } from 'react';

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

  useEffect(() => {
    const fetchNote = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Extract the actual ID from the note ID format (note-UUID)
        const actualId = noteId.startsWith('note-') ? noteId.substring(5) : noteId;

        console.log(`Fetching note with ID: ${actualId}`);
        const response = await fetch(`/api/notes/${actualId}`);

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

  return (
    <div className="bg-zinc-800/80 rounded-lg p-4 border border-zinc-700 shadow-lg">
      <h3 className="text-lg font-medium text-white mb-2">
        {note.title || 'Untitled Note'}
      </h3>
      <div className="text-zinc-300">
        <div className="prose prose-invert max-w-none">
          {/* If content is markdown, you might want to use a markdown renderer here */}
          <div dangerouslySetInnerHTML={{ __html: note.content }}></div>
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
