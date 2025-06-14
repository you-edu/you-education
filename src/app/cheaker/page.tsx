"use client";

import { useState, useEffect, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal } from 'react';
import { youtubeVideoAdder } from '../../components/mindMapGenerator/youtubeVideoAdder';

interface CheckResult {
  status: 'loading' | 'success' | 'error';
  message: string;
  results?: any;
  error?: any;
}

interface ExpandedDescriptions {
  [key: string]: boolean; // Maps "index-vIdx" to expanded state
}

export default function YoutubeVideoAdderChecker() {
  const [checkResult, setCheckResult] = useState<CheckResult>({
    status: 'loading',
    message: 'Starting check...'
  });
  const [expandedDescriptions, setExpandedDescriptions] = useState<ExpandedDescriptions>({});

  // Test topics
  const testTopics = [
    'React Hooks tutorial',
    'JavaScript async await',
    'Next.js API routes'
  ];

  const toggleDescription = (index: number, vIdx: number) => {
    const key = `${index}-${vIdx}`;
    setExpandedDescriptions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isDescriptionExpanded = (index: number, vIdx: number) => {
    const key = `${index}-${vIdx}`;
    return expandedDescriptions[key] || false;
  };

  useEffect(() => {
    const checkYoutubeVideoAdder = async () => {
      setCheckResult({
        status: 'loading',
        message: 'Running test with sample topics...'
      });

      try {
        // Check if environment variable is set
        if (!process.env.NEXT_PUBLIC_YOUTUBE_API_KEY) {
          throw new Error('YouTube API key not found. Please check your environment variables.');
        }
        
        const startTime = Date.now();
        const results = await youtubeVideoAdder(testTopics);
        const endTime = Date.now();
        
        // Check if we got only dummy videos (API issue)
        const hasDummyVideos = results.some(topic => 
          topic.youtubeVideos.some(video => video.url.includes('dummy_video_for_'))
        );

        if (hasDummyVideos) {
          setCheckResult({
            status: 'error',
            message: 'Test completed but returned dummy videos. This might indicate API issues.',
            results: results
          });
        } else {
          setCheckResult({
            status: 'success',
            message: `Test completed successfully in ${endTime - startTime}ms`,
            results: results
          });
        }
      } catch (error) {
        console.error('Error during test:', error);
        setCheckResult({
          status: 'error',
          message: 'Test failed',
          error: error instanceof Error ? error.message : String(error)
        });
      }
    };

    checkYoutubeVideoAdder();
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">YouTube Video Adder Checker</h1>
      
      {/* Status indicator */}
      <div className={`p-4 mb-8 rounded-lg ${
        checkResult.status === 'loading' ? 'bg-blue-100' : 
        checkResult.status === 'success' ? 'bg-green-100' : 'bg-red-100'
      }`}>
        <div className="flex items-center gap-3">
          {checkResult.status === 'loading' && (
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          )}
          {checkResult.status === 'success' && (
            <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {checkResult.status === 'error' && (
            <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span className="font-medium">{checkResult.message}</span>
        </div>

        {checkResult.error && (
          <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
            <pre className="text-sm text-red-700 whitespace-pre-wrap">{checkResult.error}</pre>
          </div>
        )}
      </div>

      {/* Test information */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Test Configuration</h2>
        <div className="bg-gray-100 p-4 rounded-lg">
          <p><strong>Test topics:</strong></p>
          <ul className="list-disc pl-6">
            {testTopics.map((topic, index) => (
              <li key={index} className="mb-1">{topic}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Results */}
      {checkResult.results && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Results</h2>
          
          {checkResult.results.map((result: { title: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; youtubeVideos: any[]; }, index: Key | null | undefined) => (
            <div key={index} className="mb-6 border rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-4 border-b">
                <h3 className="text-lg font-medium">Topic: {result.title}</h3>
                <p className="text-sm text-gray-500">Found {result.youtubeVideos.length} videos</p>
              </div>
              
              <div className="divide-y">
                {result.youtubeVideos.map((video, vIdx) => (
                  <div key={vIdx} className="p-4">
                    <h4 className="font-medium mb-1">{video.title}</h4>
                    <a 
                      href={video.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline text-sm"
                    >
                      {video.url}
                    </a>
                    
                    <div className="mt-2">
                      <h5 className="text-sm font-medium text-gray-700 mb-1">Description:</h5>
                      <div className="bg-gray-50 p-3 rounded border text-sm">
                        {video.description.length > 200 && !isDescriptionExpanded(Number(index), vIdx) ? (
                          <>
                            <p className="whitespace-pre-line text-gray-600">{video.description.substring(0, 200)}...</p>
                            <button 
                              onClick={() => toggleDescription(Number(index), vIdx)} 
                              className="mt-1 text-blue-600 hover:underline text-xs font-medium flex items-center"
                            >
                              Show more
                              <svg className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </>
                        ) : (
                          <>
                            <p className="whitespace-pre-line text-gray-600">{video.description}</p>
                            {video.description.length > 200 && (
                              <button 
                                onClick={() => toggleDescription(Number(index), vIdx)} 
                                className="mt-1 text-blue-600 hover:underline text-xs font-medium flex items-center"
                              >
                                Show less
                                <svg className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    
                    {video.url.includes('dummy_video_for') && (
                      <p className="mt-2 text-sm text-red-500 font-medium">
                        ⚠️ This is a dummy video (API issue)
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}