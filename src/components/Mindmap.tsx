import React, { useRef, useEffect, useState } from 'react'
import Tree from 'react-d3-tree'
import styles from '@/styles/MindMap.module.css'
import VideoPlayer from './VideoPlayer'
import ChatUI from './ChatUI'

interface TreeNode {
  name: string;
  children?: TreeNode[];
  _collapsed?: boolean;
  url?: string;
}

interface MindMapProps {
  data?: TreeNode[];
  onLeafNodeClick?: (url: string) => void; // Optional callback for parent component
}

const EmptyMindMap: React.FC = () => {
  return (
    <div className={styles['empty-mindmap']}>
      <div className={styles['empty-icon']}>🧠</div>
      <h3>Loading Mindmap</h3>
      <div className={styles['empty-dots']}>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
};

const MindMap: React.FC<MindMapProps> = ({ data = [], onLeafNodeClick }) => {
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [zoom, setZoom] = useState(0.8)
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null)
  const [showVideoChat, setShowVideoChat] = useState(false)

  const positionTreeLeftMiddle = () => {
    if (containerRef.current) {
      const dimensions = containerRef.current.getBoundingClientRect()
      setTranslate({ 
        x: dimensions.width * 0.2, 
        y: dimensions.height / 2 
      })
      setZoom(0.8)
    }
  }

  useEffect(() => {
    if (containerRef.current) {
      positionTreeLeftMiddle()
      setIsMounted(true)
    }

    const handleResize = () => {
      positionTreeLeftMiddle()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleReset = () => {
    positionTreeLeftMiddle()
  }

  const getPathClass = ({ source, target }: any, orientation: string) => {
    if (!target.children) {
      return 'mindmap-link mindmap-link--leaf'
    }
    return 'mindmap-link mindmap-link--branch'
  }

  const handleNodeClick = (nodeData: any) => {
    if (!nodeData.children && nodeData.data.url) {
      setSelectedUrl(nodeData.data.url)
      setShowVideoChat(true)
      // Still call parent callback if provided
      onLeafNodeClick?.(nodeData.data.url)
    }
  }

  const handleReturnToTree = () => {
    setShowVideoChat(false)
  }

  const hasValidData = data && data.length > 0 && data[0]?.name;

  return (
    <div className={styles['mindmap-wrapper']} style={{ position: 'relative', width: '100%', height: '85vh' }}>
      {/* Tree is always rendered, but may be visually hidden */}
      <div
        ref={containerRef}
        className={styles['mindmap-container']}
        style={{ 
          width: '100%', 
          height: '100%',
          opacity: showVideoChat ? 0.1 : 1,
          pointerEvents: showVideoChat ? 'none' : 'auto'
        }}
      >
        {isMounted && hasValidData ? (
          <>
            <Tree
              data={data[0]}
              translate={translate}
              orientation="horizontal"
              initialDepth={0}
              collapsible={true}
              pathFunc="diagonal"
              rootNodeClassName="mindmap-root"
              branchNodeClassName="mindmap-branch"
              leafNodeClassName="mindmap-leaf"
              pathClassFunc={getPathClass}
              nodeSize={{ x: 200, y: 100 }}
              separation={{ siblings: 1, nonSiblings: 1.2 }}
              zoom={zoom}
              scaleExtent={{min: 0.1, max: 2}}
              enableLegacyTransitions={false}
              onNodeClick={handleNodeClick}
              onUpdate={(state) => {
                if (state.zoom !== zoom) {
                  setZoom(state.zoom);
                }
              }}
            />
            {!showVideoChat && (
              <button className={styles['reset-button']} onClick={handleReset}>
                Reset View
              </button>
            )}
          </>
        ) : (
          <EmptyMindMap />
        )}
      </div>

      {/* Video/Chat overlay */}
      {showVideoChat && selectedUrl && (
        <div 
          className="video-chat-overlay" 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.2)',
            backdropFilter: 'blur(3px)',
            zIndex: 10,
            padding: '10px 20px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto' // Allow scrolling when content overflows
          }}
        >
          {/* Back button as an icon in top-left corner */}
          <button
            onClick={handleReturnToTree}
            className="absolute top-2 left-4 p-2 rounded-full bg-slate-800/90 text-white hover:bg-slate-700 transition-colors z-20 flex items-center justify-center"
            aria-label="Return to MindMap"
            title="Return to MindMap"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>

          {/* Responsive layout that switches to column on small screens */}
          <div 
            className="flex flex-col md:flex-row gap-4" 
            style={{ 
              height: '100%', 
              flex: 1,
              marginTop: '10px'
            }}
          >
            {/* Video player container - full width on mobile, half width on desktop */}
            <div 
              className="flex-1 min-h-[300px] md:min-h-0" 
              style={{ 
                background: 'rgba(15,23,42,0.85)', 
                borderRadius: '8px', 
                overflow: 'hidden',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <VideoPlayer url={selectedUrl} />
            </div>
            
            {/* Chat container - full width on mobile, half width on desktop */}
            <div 
              className="flex-1 min-h-[300px] md:min-h-0" 
              style={{ 
                background: 'rgba(15,23,42,0.85)', 
                borderRadius: '8px', 
                overflow: 'hidden',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <ChatUI />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MindMap