import { useState, useEffect } from 'react';
import Linkify from 'linkify-react';

interface VideoDetailsViewerProps {
  videoUrl: string;
}

// Cache interface
// interface CacheItem {
//   title: string;
//   description: string;
//   timestamp: number;
// }

// const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Options for Linkify library
const linkifyOptions = {
  defaultProtocol: 'https',
  target: '_blank',
  rel: 'noopener noreferrer',
  className: 'text-blue-500 hover:text-blue-700 hover:underline'
};

const VideoDetailsViewer: React.FC<VideoDetailsViewerProps> = ({ videoUrl }) => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideoDetails = async () => {
      if (!videoUrl) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // // Check cache first
        // const cacheKey = `video-details-${videoUrl}`;
        // const cachedData = localStorage.getItem(cacheKey);
        
        // if (cachedData) {
        //   const parsedData = JSON.parse(cachedData) as CacheItem;
          
        //   // Check if cache is still valid
        //   if (Date.now() - parsedData.timestamp < CACHE_EXPIRY) {
        //     setTitle(parsedData.title);
        //     setDescription(parsedData.description);
        //     setLoading(false);
        //     return;
        //   }
        // }
        
        // Call the backend API if no valid cache exists
        const response = await fetch(`/api/youtube?videoUrl=${encodeURIComponent(videoUrl)}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch video details');
        }
        
        const data = await response.json();
        setTitle(data.title);
        setDescription(data.description);
        
        // Save to cache
        // localStorage.setItem(cacheKey, JSON.stringify({
        //   title: data.title,
        //   description: data.description,
        //   timestamp: Date.now()
        // }));
      } catch (err) {
        setError(`Error fetching video details: ${err instanceof Error ? err.message : 'Unknown error'}`);
        console.error('Error fetching video details:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVideoDetails();
  }, [videoUrl]);

  if (loading) {
    return <div className="w-full h-full flex items-center justify-center">Loading video details...</div>;
  }

  if (error) {
    return <div className="error w-full h-full flex items-center justify-center">{error}</div>;
  }
  
  return (
    <div className="video-details bg-gray-50 dark:bg-zinc-800/50 rounded-lg w-full h-full overflow-y-auto p-0 m-0">
      <div className="px-2">
        {title && (
          <h2 className="video-title text-2xl font-bold text-gray-800 dark:text-gray-100 border-b border-gray-300 dark:border-gray-600 pb-2 break-words">
            {title}
          </h2>
        )}
        {description && (
          <div className="video-description text-base text-gray-600 dark:text-gray-300 whitespace-pre-wrap overflow-hidden">
            <h3 className="text-lg font-semibold mt-1 mb-1 text-gray-700 dark:text-gray-200">Description:</h3>
            <div className="break-words">
              {description.split('\n').map((line, index) => (
                <p key={index} className="mb-1">
                  <Linkify options={linkifyOptions}>{line}</Linkify>
                </p>
              ))}
            </div>
          </div>
        )}
        {!title && !description && !loading && (
          <p className="text-gray-500 dark:text-gray-400 italic">Enter a valid YouTube URL to see video details.</p>
        )}
      </div>
    </div>
  );
};

export default VideoDetailsViewer;