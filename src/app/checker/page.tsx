"use client";

import { useState, useEffect } from 'react';
import { youtubeVideoAdder } from '../../components/mindMapGenerator/youtubeVideoAdder';
import { generateMindMapWithRelevantContent } from '../../components/mindMapGenerator/releventVideoSelector';
import { processNotesForMindMap } from '../../components/mindMapGenerator/notesAdder';
import { testNotesAdder } from '../../components/mindMapGenerator/testNotesAdder';

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

interface NotesResult {
  status: 'loading' | 'idle' | 'success' | 'error';
  message: string;
  data?: {
    updatedMindMap: MindMapNode;
    notesMap: NotesMap;
  };
  error?: any;
}

interface ExpandedDescriptions {
  [key: string]: boolean; // Maps "index-vIdx" to expanded state
}

interface NotesMap {
  [dataId: string]: string;
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
  const [notesResult, setNotesResult] = useState<NotesResult>({
    status: 'idle',
    message: 'Notes will be generated after mind map is created...'
  });
  const [expandedDescriptions, setExpandedDescriptions] = useState<ExpandedDescriptions>({});
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [testNotesStatus, setTestNotesStatus] = useState<string>('');

  // Test topics
  const testTopics = [
    'Formal Grammar and their application to Syntax Analysis',
    'BNF Notation',
    'YACC'
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
          const mindMap = await generateMindMapWithRelevantContent(videoResults, "Compiler Design: Syntax Analysis");
          const mindMapEndTime = Date.now();

          if (mindMap) {
            setMindMapResult({
              status: 'success',
              message: `Mind map generated successfully in ${mindMapEndTime - mindMapStartTime}ms`,
              data: mindMap
            });
            
            // Now generate notes from the mind map
            setNotesResult({
              status: 'loading',
              message: 'Generating notes from mind map...'
            });
            
            try {
              const notesStartTime = Date.now();
              const processResult = await processNotesForMindMap(mindMap);
              const notesEndTime = Date.now();
              
              if (processResult && processResult.notesMap) {
                const noteCount = Object.keys(processResult.notesMap).length;
                setNotesResult({
                  status: 'success',
                  message: `Generated ${noteCount} notes in ${notesEndTime - notesStartTime}ms`,
                  data: processResult
                });
                
                // Update the mind map with the version that has descriptions removed
                setMindMapResult(prev => ({
                  ...prev,
                  data: processResult.updatedMindMap
                }));
                
                // Set the first note as selected if available
                const firstNoteId = Object.keys(processResult.notesMap)[0];
                if (firstNoteId) {
                  setSelectedNoteId(firstNoteId);
                }
              } else {
                throw new Error("No notes were generated");
              }
            } catch (notesError) {
              console.error('Error generating notes:', notesError);
              setNotesResult({
                status: 'error',
                message: 'Failed to generate notes',
                error: notesError instanceof Error ? notesError.message : String(notesError)
              });
            }
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

  const runNotesAdderTest = async () => {
    setTestNotesStatus('Running test...');
    try {
      await testNotesAdder();
      setTestNotesStatus('Test completed. Check console for detailed results.');
    } catch (error) {
      setTestNotesStatus(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Recursive component to render the mind map
  const renderMindMapNode = (node: MindMapNode, path: string = "root") => {
    const hasSubtopics = node.subtopics && node.subtopics.length > 0;
    const expanded = isNodeExpanded(path);
    const hasNotes = node.resources?.type === 'md_notes' && node.resources.data.id;
    const noteId = hasNotes ? node.resources?.data.id : undefined;
    
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
          <h3 className={`font-medium ${hasNotes && selectedNoteId === noteId ? 'text-blue-600' : ''}`}>
            {node.title}
          </h3>
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
            
            {node.resources.type === 'md_notes' && node.resources.data.id && (
              <div 
                className={`flex items-center cursor-pointer ${selectedNoteId === node.resources.data.id ? 'text-blue-600' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNoteId(node.resources?.data.id ?? null);
                }}
              >
                <svg className="h-4 w-4 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm hover:underline">
                  View Notes
                </span>
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

  // Find the title of the note by its ID
  const findNoteTitle = (nodeId: string, node: MindMapNode): string | null => {
    if (node.resources?.data.id === nodeId) {
      return node.title;
    }
    
    if (node.subtopics) {
      for (const subtopic of node.subtopics) {
        const title = findNoteTitle(nodeId, subtopic);
        if (title) return title;
      }
    }
    
    return null;
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">YouTube Video Adder & Mind Map Checker</h1>
      
      {/* Test Notes Adder Button */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Debug Notes Adder</h2>
        <p className="mb-3">Run a standalone test of the Notes Adder functionality with a sample mind map.</p>
        <div className="flex items-center gap-3">
          <button 
            onClick={runNotesAdderTest}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Run Notes Adder Test
          </button>
          {testNotesStatus && (
            <span className="text-sm text-gray-600">{testNotesStatus}</span>
          )}
        </div>
        <p className="mt-3 text-sm text-gray-600">
          Open the browser console to see detailed debug information during the test.
        </p>
      </div>
      
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
          <p><strong>Chapter:</strong> Compiler Design: Syntax Analysis</p>
          <p className="mt-2"><strong>Test topics:</strong></p>
          <ul className="list-disc pl-6">
            {testTopics.map((topic, index) => (
              <li key={index} className="mb-1">{topic}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Results Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div>
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
          </div>

          {/* Notes Generation Status */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Notes Generation</h2>
            
            <div className={`p-4 mb-6 rounded-lg ${
              notesResult.status === 'idle' ? 'bg-gray-100' :
              notesResult.status === 'loading' ? 'bg-blue-100' : 
              notesResult.status === 'success' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <div className="flex items-center gap-3">
                {notesResult.status === 'loading' && (
                  <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                )}
                {notesResult.status === 'success' && (
                  <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {notesResult.status === 'error' && (
                  <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <span className="font-medium">{notesResult.message}</span>
              </div>

              {notesResult.error && (
                <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
                  <pre className="text-sm text-red-700 whitespace-pre-wrap">{notesResult.error}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right Column - Notes Viewer */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Notes Preview</h2>
          
          {notesResult.status === 'success' && notesResult.data && (
            <div>
              {/* Notes Selection */}
              <div className="mb-4">
                <label htmlFor="note-selector" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Topic:
                </label>
                <select 
                  id="note-selector" 
                  className="block w-full p-2 border border-gray-300 rounded-md"
                  value={selectedNoteId || ''}
                  onChange={(e) => setSelectedNoteId(e.target.value)}
                >
                  {Object.entries(notesResult.data.notesMap).map(([noteId]) => {
                    const title = findNoteTitle(noteId, notesResult.data!.updatedMindMap) || noteId;
                    return (
                      <option key={noteId} value={noteId}>
                        {title}
                      </option>
                    );
                  })}
                </select>
              </div>
              
              {/* Notes Content */}
              {selectedNoteId && (
                <div className="border rounded-lg p-5 bg-white shadow-sm overflow-auto max-h-[600px] markdown-content">
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: markdownToHtml(notesResult.data.notesMap[selectedNoteId] || '') 
                    }} 
                  />
                </div>
              )}
            </div>
          )}
          
          {notesResult.status !== 'success' && (
            <div className="border rounded-lg p-5 bg-gray-50 shadow-sm text-center">
              <p className="text-gray-500">
                {notesResult.status === 'loading' 
                  ? 'Generating notes...' 
                  : 'Notes will appear here once generated'}
              </p>
            </div>
          )}
          
          {/* View Raw Notes JSON option */}
          {notesResult.status === 'success' && notesResult.data && (
            <div className="mt-4">
              <details className="bg-gray-50 p-4 rounded-lg border">
                <summary className="font-medium text-sm cursor-pointer">View Raw Notes JSON</summary>
                <pre className="mt-3 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-96">
                  {JSON.stringify(notesResult.data.notesMap, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>

      {/* Raw JSON Data */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Raw Data</h2>
        
        {/* View Raw Video Results JSON */}
        {checkResult.status === 'success' && checkResult.results && (
          <div className="mt-4 mb-4">
            <details className="bg-gray-50 p-4 rounded-lg border">
              <summary className="font-medium text-sm cursor-pointer">View Raw Video Results JSON</summary>
              <pre className="mt-3 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-96">
                {JSON.stringify(checkResult.results, null, 2)}
              </pre>
            </details>
          </div>
        )}
        
        {/* View Raw Mind Map JSON option */}
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

// Simple markdown to HTML converter for rendering notes
function markdownToHtml(markdown: string): string {
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
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 p-3 rounded my-3 overflow-auto"><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
    // Line breaks
    .replace(/\n/g, '<br>');
  
  // Fix nested lists problem (quick and dirty solution)
  html = html.replace(/<\/ul><br><ul class="list-disc pl-5 my-2">/g, '');
  html = html.replace(/<\/ol><br><ol class="list-decimal pl-5 my-2">/g, '');
  
  return html;
}