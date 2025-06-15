"use client"
import React, { useState, useMemo, useCallback } from 'react';
import MindMap from '@/components/Mindmap';
import VideoPlayer from '@/components/VideoPlayer';

const ChapterPage: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  // Helper function to transform the nested JSON structure into the format expected by MindMap
  const transformData = (node: any): any => {
    // Base case: if it's an end node with resources, create leaf nodes for each resource
    if (node.is_end_node && node.resources) {
      return {
        name: node.title,
        children: node.resources.map((resource: any) => ({
          name: resource.data.title || resource.id,
          url: resource.data.url
        }))
      };
    }
    
    // For nodes with subtopics, recursively transform each subtopic
    if (node.subtopics) {
      return {
        name: node.title,
        children: node.subtopics.map(transformData)
      };
    }
    
    // For end nodes without resources (shouldn't happen with given data)
    return { name: node.title };
  };

const compilerDesignData = {
  "title": "Compiler Design   Syntax Analysis",
  "is_end_node": false,
  "subtopics": [
    {
      "title": "1. Foundations of Formal Languages",
      "is_end_node": false,
      "subtopics": [
        {
          "title": "1.1 Formal Grammar Theory",
          "is_end_node": true,
          "resources": [
            {
              "id": "res-1",
              "type": "youtube_link",
              "data": {
                "url": "https://www.youtube.com/watch?v=5Jd54dxQ1_Q",
                "title": "Lec-5: What is Grammar in TOC | Must Watch",
                "length": "11:08",
                "views": "1,207,121"
              }
            },
            {
              "id": "res-2",
              "type": "youtube_link",
              "data": {
                "url": "https://www.youtube.com/watch?v=_C50_b8UwW4",
                "title": "CD11: Formal Grammar in Compiler Design | Application of Grammar in Syntax Analysis | BNF Notation",
                "length": "13:51",
                "views": "42,230"
              }
            }
          ]
        },
        {
          "title": "1.2 BNF Notation",
          "is_end_node": true,
          "resources": [
            {
              "id": "res-3",
              "type": "youtube_link",
              "data": {
                "url": "https://www.youtube.com/watch?v=MMxMeX5emUA",
                "title": "Programming Language Syntax: Backus-Naur Form (BNF)",
                "length": "7:58",
                "views": "74,418"
              }
            }
          ]
        },
        {
          "title": "1.3 Context-Free Grammars (CFG)",
          "is_end_node": true,
          "resources": [
            {
              "id": "res-4",
              "type": "youtube_link",
              "data": {
                "url": "https://www.youtube.com/watch?v=5_tfVe7ED3g",
                "title": "Context Free Grammar & Context Free Language",
                "length": "7:52",
                "views": "1,531,317"
              }
            }
          ]
        }
      ]
    },
    {
      "title": "2. Derivation & Parse Trees",
      "is_end_node": true,
      "resources": [
        {
          "id": "res-5",
          "type": "youtube_link",
          "data": {
            "url": "https://www.youtube.com/watch?v=u4-rpIlV9NI",
            "title": "Derivation Tree (Left & Right Derivation Trees)",
            "length": "12:33",
            "views": "1,063,451"
          }
        }
      ]
    },
    {
      "title": "3. Parsing Techniques",
      "is_end_node": false,
      "subtopics": [
        {
          "title": "3.1 Top-Down Parsing",
          "is_end_node": true,
          "resources": [
            {
              "id": "res-6",
              "type": "youtube_link",
              "data": {
                "url": "https://www.youtube.com/watch?v=mP6YNYSpZV4",
                "title": "Top Down Parsing | Requirement and Time Complexity of Top Down Parser | Parsers in Compiler Design",
                "length": "12:29",
                "views": "41,835"
              }
            }
          ]
        },
        {
          "title": "3.2 Predictive Parsers (LL(1))",
          "is_end_node": true,
          "resources": [
            {
              "id": "res-7",
              "type": "youtube_link",
              "data": {
                "url": "https://www.youtube.com/watch?v=WTxdKQmsfho",
                "title": "Lec-8: LL(1) Parsing Table | Check Whether a Grammar is LL(1) or Not",
                "length": "10:57",
                "views": "1,703,910"
              }
            }
          ]
        },
        {
          "title": "3.3 Bottom-Up Parsing",
          "is_end_node": false,
          "subtopics": [
            {
              "title": "3.3.1 Shift-Reduce Parsing",
              "is_end_node": true,
              "resources": [
                {
                  "id": "res-8",
                  "type": "youtube_link",
                  "data": {
                    "url": "https://www.youtube.com/watch?v=SemmXpNeTx4",
                    "title": "Bottom Up Parsers Part-1 | Parsing | Shift Reduce Parser | Compiler Design",
                    "length": "23:39",
                    "views": "65,044"
                  }
                }
              ]
            },
            {
              "title": "3.3.2 Operator Precedence Parsing",
              "is_end_node": true,
              "resources": [
                {
                  "id": "res-9",
                  "type": "youtube_link",
                  "data": {
                    "url": "https://www.youtube.com/watch?v=l29-94pGOWg",
                    "title": "Operator Precedence Parser with Solved Examples | Operator Grammar | GATECS | Compiler Design",
                    "length": "27:01",
                    "views": "147,331"
                  }
                }
              ]
            },
            {
              "title": "3.3.3 LR-Family Parsers",
              "is_end_node": false,
              "subtopics": [
                {
                  "title": "3.3.3.1 LR(0) Parsers",
                  "is_end_node": true,
                  "resources": [
                    {
                      "id": "res-10",
                      "type": "youtube_link",
                      "data": {
                        "url": "https://www.youtube.com/watch?v=MWX0-_mHYcc",
                        "title": "LR Parsing | LR (0) item | LR (0) Parsing table solved example | Compiler Design Lectures for Gate",
                        "length": "31:59",
                        "views": "619,948"
                      }
                    }
                  ]
                },
                {
                  "title": "3.3.3.2 SLR(1) Parsers",
                  "is_end_node": true,
                  "resources": [
                    {
                      "id": "res-11",
                      "type": "youtube_link",
                      "data": {
                        "url": "https://www.youtube.com/watch?v=Z1Hu9TIef9k",
                        "title": "Lec-12: SLR(1) Parsing Table | Check Whether a Grammar is SLR(1) or Not | Bottom-Up Parser",
                        "length": "7:46",
                        "views": "1,048,065"
                      }
                    }
                  ]
                },
                {
                  "title": "3.3.3.3 CLR(1) Parsers",
                  "is_end_node": true,
                  "resources": [
                    {
                      "id": "res-12",
                      "type": "youtube_link",
                      "data": {
                        "url": "https://www.youtube.com/watch?v=sMxqUQc_jHQ",
                        "title": "Lec-13: CLR Parsing Table | LR(1) Canonical Items",
                        "length": "11:50",
                        "views": "947,213"
                      }
                    }
                  ]
                },
                {
                  "title": "3.3.3.4 LALR(1) Parsers",
                  "is_end_node": true,
                  "resources": [
                    {
                      "id": "res-13",
                      "type": "youtube_link",
                      "data": {
                        "url": "https://www.youtube.com/watch?v=GOlsYofJjyQ",
                        "title": "Lec-14: LALR Parsing Table | LALR vs CLR | Compiler Design",
                        "length": "13:06",
                        "views": "629,960"
                      }
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "title": "4. Parser Generators",
      "is_end_node": false,
      "subtopics": [
        {
          "title": "4.1 Automatic Parser Generator",
          "is_end_node": true,
          "resources": [
            {
              "id": "res-14",
              "type": "youtube_link",
              "data": {
                "url": "https://www.youtube.com/watch?v=dl13Ba25j58",
                "title": "Automatic Parser Generator",
                "length": "31:29",
                "views": "301"
              }
            }
          ]
        },
        {
          "title": "4.2 YACC (Yet Another Compiler-Compiler)",
          "is_end_node": false,
          "subtopics": [
            {
              "title": "4.2.1 Introduction to YACC",
              "is_end_node": true,
              "resources": [
                {
                  "id": "res-15",
                  "type": "youtube_link",
                  "data": {
                    "url": "https://www.youtube.com/watch?v=yTXCPGAD3SQ",
                    "title": "Introduction to yacc",
                    "length": "11:57",
                    "views": "123,605"
                  }
                }
              ]
            },
            {
              "title": "4.2.2 YACC Examples (Hindi)",
              "is_end_node": true,
              "resources": [
                {
                  "id": "res-16",
                  "type": "youtube_link",
                  "data": {
                    "url": "https://www.youtube.com/watch?v=87K0nHA_F5Y",
                    "title": "YACC in Hindi | YACC (Yet Another Compiler Compiler) in Compiler Design",
                    "length": "14:58",
                    "views": "105,655"
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

  // Use useMemo to prevent recreating the data structure on each render
  const memoizedData = useMemo(() => compilerDesignData, []);

  // Use useCallback to prevent recreating the function on each render
  const handleLeafClick = useCallback((selection: any) => {
    console.log("Leaf node clicked:", selection);
    if (selection && selection.resource && selection.resource.data && selection.resource.data.url) {
      console.log("Setting selected video URL:", selection.resource.data.url);
      
      setSelectedVideo(selection.resource.data.url);
    } else if (typeof selection === 'string') {
      // Fallback for simpler implementations that just pass a URL string
      setSelectedVideo(selection);
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-2 min-h-screen flex flex-col">
      <div className="flex flex-col md:flex-row gap-4 flex-grow">
        {selectedVideo && (
          <div className="w-full md:w-1/4">
            <div className="sticky top-4">
              <VideoPlayer url={selectedVideo} />
            </div>
          </div>
        )}
        <div className={`w-full ${selectedVideo ? 'md:w-3/4' : 'md:w-full'} flex-grow`}>
          <div className="h-full">
            <MemoizedMindMap 
              data={memoizedData} 
              onLeafClick={handleLeafClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Create a memoized version of the MindMap component
const MemoizedMindMap = React.memo(MindMap);

export default ChapterPage;


