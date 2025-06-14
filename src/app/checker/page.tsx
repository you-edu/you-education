"use client";

import { useState, useEffect, Key } from 'react';
import { youtubeVideoAdder } from '../../components/mindMapGenerator/youtubeVideoAdder';
import { generateMindMapWithRelevantContent } from '../../components/mindMapGenerator/releventVideoSelector';

interface CheckResult {
  status: 'loading' | 'success' | 'error';
  message: string;
  results?: any;
  error?: any;
}

interface MindMapResult {
  status: 'loading' | 'success' | 'error';
  message: string;
  data?: any;
  error?: any;
}

interface ExpandedDescriptions {
  [key: string]: boolean; // Maps "index-vIdx" to expanded state
}

interface Resource {
  id: string;
  type: string;
  description?: string;
  data: {
    url?: string;
    id?: string;
  };
}

interface MindMapNode {
  title: string;
  is_end_node: boolean;
  subtopics?: MindMapNode[];
  resources?: Resource;
}

export default function YoutubeVideoAdderChecker() {
  const [checkResult, setCheckResult] = useState<CheckResult>({
    status: 'loading',
    message: 'Starting check...'
  });
  const [mindMapResult, setMindMapResult] = useState<MindMapResult>({
    status: 'loading',
    message: 'Mind map will be generated after videos are fetched...'
  });
  const [expandedDescriptions, setExpandedDescriptions] = useState<ExpandedDescriptions>({});
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  // Test topics
  const testTopics = [
    'Definition',
    'Phases and Passes',
    'FSM & REs and their application to Lexical Analysis',
    'Implementation of Lexical Analyzers',
    'Lexical-Analyzer Generator',
    'Lex-Compiler'
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

  const toggleNode = (nodePath: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodePath]: !prev[nodePath]
    }));
  };

  const isNodeExpanded = (nodePath: string) => {
    return expandedNodes[nodePath] !== false; // Default to expanded
  };

  useEffect(() => {
    const runTests = async () => {
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
        const videoResults = await youtubeVideoAdder(testTopics);
        const endTime = Date.now();
        
        // Check if we got only dummy videos (API issue)
        const hasDummyVideos = videoResults.some(topic => 
          topic.youtubeVideos.some(video => video.url.includes('dummy_video_for_'))
        );

        if (hasDummyVideos) {
          setCheckResult({
            status: 'error',
            message: 'Test completed but returned dummy videos. This might indicate API issues.',
            results: videoResults
          });
        } else {
          setCheckResult({
            status: 'success',
            message: `Test completed successfully in ${endTime - startTime}ms`,
            results: videoResults
          });
        }

        // Now generate mind map from the videos
        setMindMapResult({
          status: 'loading',
          message: 'Generating mind map from videos...'
        });

        try {
          const mindMapStartTime = Date.now();
          const mindMap = await generateMindMapWithRelevantContent(videoResults);
          const mindMapEndTime = Date.now();

          if (mindMap) {
            setMindMapResult({
              status: 'success',
              message: `Mind map generated successfully in ${mindMapEndTime - mindMapStartTime}ms`,
              data: mindMap
            });
          } else {
            throw new Error("Failed to generate mind map");
          }
        } catch (mindMapError) {
          console.error('Error generating mind map:', mindMapError);
          setMindMapResult({
            status: 'error',
            message: 'Failed to generate mind map',
            error: mindMapError instanceof Error ? mindMapError.message : String(mindMapError)
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

    runTests();
  }, []);

  // Recursive component to render the mind map
  const renderMindMapNode = (node: MindMapNode, path: string = "root") => {
    const hasSubtopics = node.subtopics && node.subtopics.length > 0;
    const expanded = isNodeExpanded(path);
    
    return (
      <div className="ml-4 border-l-2 border-gray-200 pl-4 my-2">
        <div 
          className={`flex items-center ${hasSubtopics ? 'cursor-pointer' : ''}`}
          onClick={hasSubtopics ? () => toggleNode(path) : undefined}
        >
          {hasSubtopics && (
            <span className="mr-2 text-gray-500">
              {expanded ? '▼' : '►'}
            </span>
          )}
          <h3 className="font-medium">{node.title}</h3>
        </div>
        
        {node.resources && (
          <div className="mt-2 ml-6">
            {node.resources.type === 'youtube_link' && node.resources.data.url && (
              <div className="flex items-center">
                <svg className="h-4 w-4 text-red-500 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                </svg>
                <a 
                  href={node.resources.data.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline text-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  YouTube Video
                </a>
              </div>
            )}
            
            {node.resources.type === 'md_notes' && (
              <div>
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm text-gray-700">Notes</span>
                </div>
                
                {node.resources.description && (
                  <div className="mt-1 ml-5 text-xs text-gray-500 italic">
                    {node.resources.description}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {expanded && hasSubtopics && (
          <div className="mt-2">
            {node.subtopics!.map((subtopic, idx) => (
              <div key={idx}>
                {renderMindMapNode(subtopic, `${path}-${idx}`)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">YouTube Video Adder Checker</h1>
      
      {/* Status indicator for Video Fetching */}
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
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Video Results</h2>
          
          {checkResult.results.map((result: any, index: Key | null | undefined) => (
            <div key={index} className="mb-6 border rounded-lg overflow-hidden shadow-sm">
              <div className="bg-gray-50 p-4 border-b">
                <h3 className="text-lg font-medium">Topic: {result.title}</h3>
                <p className="text-sm text-gray-500">Found {result.youtubeVideos.length} videos</p>
              </div>
              
              <div className="divide-y">
                {result.youtubeVideos.map((video: any, vIdx: any) => (
                  <div key={vIdx} className="p-4">
                    <h4 className="font-medium mb-1">{video.title}</h4>
                    <div className="flex flex-wrap gap-x-4 text-sm text-gray-600 mb-2">
                      <span>Length: {video.length}</span>
                      <span>Views: {video.views}</span>
                      <span>Likes: {video.likes}</span>
                    </div>
                    <a 
                      href={video.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline text-sm"
                    >
                      {video.url}
                    </a>
                    
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

      {/* Mind Map Results */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Mind Map</h2>
        
        <div className={`p-4 mb-6 rounded-lg ${
          mindMapResult.status === 'loading' ? 'bg-blue-100' : 
          mindMapResult.status === 'success' ? 'bg-green-100' : 'bg-red-100'
        }`}>
          <div className="flex items-center gap-3">
            {mindMapResult.status === 'loading' && (
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
            )}
            {mindMapResult.status === 'success' && (
              <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {mindMapResult.status === 'error' && (
              <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className="font-medium">{mindMapResult.message}</span>
          </div>

          {mindMapResult.error && (
            <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
              <pre className="text-sm text-red-700 whitespace-pre-wrap">{mindMapResult.error}</pre>
            </div>
          )}
        </div>
        
        {mindMapResult.status === 'success' && mindMapResult.data && (
          <div className="border rounded-lg p-5 bg-white shadow-sm">
            <h3 className="text-lg font-semibold mb-3">{mindMapResult.data.title}</h3>
            {mindMapResult.data.subtopics?.map((subtopic: MindMapNode, idx: number) => (
              <div key={idx}>
                {renderMindMapNode(subtopic, `root-${idx}`)}
              </div>
            ))}
          </div>
        )}

        {/* View Raw JSON option */}
        {mindMapResult.status === 'success' && mindMapResult.data && (
          <div className="mt-4">
            <details className="bg-gray-50 p-4 rounded-lg border">
              <summary className="font-medium text-sm cursor-pointer">View Raw Mind Map JSON</summary>
              <pre className="mt-3 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-96">
                {JSON.stringify(mindMapResult.data, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}