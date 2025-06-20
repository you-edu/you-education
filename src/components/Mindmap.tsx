"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Transformer } from 'markmap-lib';
import { Markmap } from 'markmap-view';
import { INode } from 'markmap-common';
import { useTheme } from 'next-themes';

// Updated API response types to match new format
type ApiResourceData = {
  url?: string;
  content?: string;
  title?: string;
  length?: string;
  views?: string;
  id?: string; // Added for notes
  // other data
};

type ApiResource = { 
  id: string; 
  type: string;
  data: ApiResourceData;
};

type ApiNode = {
  title: string;
  is_end_node: boolean;
  subtopics?: ApiNode[];
  resources?: ApiResource[]; // Updated to array of resources
};

// Map to store resources by their path
const resourceMap = new Map<string, { node: ApiNode; resource?: ApiResource }>();
// Map to store node paths by their content (for reverse lookup)
const nodePathMap = new Map<string, string>();

// Function to decode HTML entities and normalize text
function normalizeText(text: string): string {
  // Create a temporary DOM element to decode HTML entities
  const tempElement = document.createElement('div');
  tempElement.innerHTML = text;
  const decoded = tempElement.textContent || tempElement.innerText || text;
  
  // Additional normalization for common issues
  return decoded
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

// Convert API JSON to markdown and populate resourceMap
function apiToMarkdown(node: ApiNode, level = 1, path = ""): string {
  // Handle null or undefined node
  if (!node) {
    console.error("Received null or undefined node in apiToMarkdown");
    return "# Error Loading Data\n";
  }

  const currentPath = path ? `${path} > ${node.title}` : node.title;
  
  // Add the node to resourceMap (for topic nodes)
  resourceMap.set(currentPath, { node });
  
  // Store the mapping from node content to its full path (with normalization)
  nodePathMap.set(node.title, currentPath);
  nodePathMap.set(normalizeText(node.title), currentPath);
  
  let md = `${'#'.repeat(level)} ${node.title}\n`;
  
  // Add resources as nodes if they exist
  if (node.resources && node.resources.length > 0) {
    node.resources.forEach(resource => {
      // Use different icons for different resource types
      let icon = '📺'; // Default for videos
      if (resource.type === 'md_notes') {
        icon = '📝'; // Use note icon for notes
      }
      let resourceTitle
      if(resource.type === 'md_notes') {
        resourceTitle = "Notes"
      }else{
        resourceTitle = "Youtube Video"
      }
       
      const resourcePath = `${currentPath} > ${resourceTitle}`;
      
      // Store resource in map for later lookup
      resourceMap.set(resourcePath, { node, resource });
      
      // Store the mapping from resource content to its full path
      nodePathMap.set(`${icon} ${resourceTitle}`, resourcePath);
      
      // Add resource as a markdown item
      md += `${'#'.repeat(level + 1)} ${icon} ${resourceTitle}\n`;
    });
  }
  
  // Add subtopics
  if (node.subtopics) {
    node.subtopics.forEach(child => {
      md += apiToMarkdown(child, level + 1, currentPath);
    });
  }
  
  return md;
}

// Alternative path building function using the node hierarchy
function buildPathFromNode(nodeData: INode): string {
  // Normalize the node content to handle HTML entities
  const normalizedContent = normalizeText(nodeData.content);
  console.log("Original content:", nodeData.content, "Normalized:", normalizedContent);
  
  // Method 1: Try to use the stored path mapping with normalized content
  const directPath = nodePathMap.get(normalizedContent);
  if (directPath) {
    console.log("Found direct path mapping:", directPath);
    return directPath;
  }
  
  // Also try with original content in case normalization isn't needed
  const originalDirectPath = nodePathMap.get(nodeData.content);
  if (originalDirectPath) {
    console.log("Found direct path mapping with original content:", originalDirectPath);
    return originalDirectPath;
  }
  
  // Method 2: Build path by traversing ancestors if available
  const pathParts: string[] = [];
  let currentNode: INode | undefined = nodeData;
  
  // Collect all ancestors
  while (currentNode) {
    pathParts.unshift(normalizeText(currentNode.content));
    // Try different ways to access parent
    currentNode = (currentNode as any).parent || 
                  (currentNode as any).data?.parent ||
                  (currentNode as any).state?.parent;
  }
  
  const builtPath = pathParts.join(' > ');
  console.log("Built path from traversal:", builtPath);
  
  // Method 3: If traversal doesn't work, try to find by content matching
  if (builtPath === normalizedContent) {
    // Single node, try to find it in our resource map
    for (const [mapPath, mapItem] of resourceMap.entries()) {
      const normalizedMapPath = normalizeText(mapPath);
      const cleanContent = normalizedContent.replace('📺 ', '');
      
      if (normalizedMapPath.endsWith(normalizedContent) || 
          normalizedMapPath.endsWith(cleanContent) ||
          mapPath.endsWith(nodeData.content) || 
          mapPath.endsWith(nodeData.content.replace('📺 ', ''))) {
        console.log("Found path by content matching:", mapPath);
        return mapPath;
      }
    }
  }
  
  return builtPath;
}

// Enhanced click handler with better path detection
function createClickHandler(onLeafClick: (selection: any) => void) {
  return (event: MouseEvent) => {
    console.log("Click detected on:", event.target);
    
    // Try to find the closest markmap-node element
    const nodeG = (event.target as Element).closest('g.markmap-node') as SVGGElement;
    if (!nodeG) {
      console.log("No markmap-node found in the event path");
      return;
    }
    
    // Check if __data__ exists
    if (!(nodeG as any).__data__) {
      console.log("No __data__ found on node:", nodeG);
      return;
    }
    
    const nodeData = (nodeG as any).__data__ as INode;
    console.log("Node data found:", nodeData);
    
    // Use our enhanced path building function
    const path = buildPathFromNode(nodeData);
    console.log("Final computed path:", path);
    
    // Debug: print all available paths
    console.log("All available paths in resourceMap:", Array.from(resourceMap.keys()));
    
    // Look up the node in our map
    const mapItem = resourceMap.get(path);
    
    if (!mapItem) {
      console.warn("No mapping found for path:", path);
      // Try fuzzy matching as fallback with normalization
      const normalizedPath = normalizeText(path);
      const normalizedContent = normalizeText(nodeData.content);
      
      for (const [mapPath, mapItem] of resourceMap.entries()) {
        const normalizedMapPath = normalizeText(mapPath);
        const cleanContent = normalizedContent.replace('📺 ', '');
        const cleanMapContent = normalizedMapPath.split(' > ').pop() || '';
        
        if (normalizedMapPath.includes(cleanContent) || 
            cleanContent.includes(cleanMapContent) ||
            mapPath.includes(nodeData.content.replace('📺 ', '')) || 
            nodeData.content.replace('📺 ', '').includes(mapPath.split(' > ').pop() || '')) {
          console.log("Found fuzzy match:", mapPath, "for content:", nodeData.content);
          handleNodeSelection(mapItem, event, onLeafClick);
          return;
        }
      }
      return;
    }
    
    handleNodeSelection(mapItem, event, onLeafClick);
  };
}

// Separate function to handle node selection logic
function handleNodeSelection(
  mapItem: { node: ApiNode; resource?: ApiResource }, 
  event: MouseEvent, 
  onLeafClick: (selection: any) => void
) {
  const { node, resource } = mapItem;
  
  // Check if this is a resource node (indicated by the resource property)
  if (resource) {
    event.stopPropagation();
    console.log("Resource node clicked:", resource);
    
    // Create the selection object that will be passed to the parent
    const selection = {
      title: node.title,
      resources: [resource], // Just this specific resource
      resource: resource,    // Provide the specific resource that was clicked
      type: resource.type
    };
    
    // Log what we're about to send
    console.log("About to call onLeafClick with:", selection);
    
    // Call the parent's callback directly
    onLeafClick(selection);
    
    return;
  }
  
  // For topic nodes that have resources, treat them as clickable leaf nodes
  if (node.is_end_node && node.resources && node.resources.length > 0) {
    event.stopPropagation();
    console.log("Topic node with resources clicked:", node);
    
    // Create the selection object that will be passed to the parent
    const selection = {
      title: node.title,
      resources: node.resources,
      type: node.resources[0]?.type
    };
    
    // Log what we're about to send
    console.log("About to call onLeafClick with:", selection);
    
    // Call the parent's callback directly
    onLeafClick(selection);
  }
}

// Add these props to your MindMap component interface
interface MindMapProps {
  data: any;
  onLeafClick: (selection: any) => void;
  height?: string | number;
  width?: string | number;
  autoFit?: boolean;
}

const MindMap: React.FC<MindMapProps> = ({ 
  data, 
  onLeafClick,
  height = "100%",
  width = "100%",
  autoFit = false
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const markmapRef = useRef<Markmap | null>(null);
  const transformer = new Transformer();
  const { theme, resolvedTheme } = useTheme();
  const initializedRef = useRef(false);

  const [zoomLevel, setZoomLevel] = useState(1);
  const [is3DView, setIs3DView] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [showVideoChat, setShowVideoChat] = useState(false);

  // This effect runs once to initialize the mind map
  useEffect(() => {
    console.log("MindMap component received data:", data);
    
    // Only run on client side
    if (typeof window === 'undefined' || !svgRef.current || initializedRef.current) return;
    
    // Prepare markdown from API data
    resourceMap.clear();
    nodePathMap.clear(); // Clear the path mapping as well
    
    try {
      // Generate markdown from the data
      let md;
      if (data) {
        md = apiToMarkdown(data);
        console.log("Generated markdown:", md);
        console.log("Resource map populated with paths:", Array.from(resourceMap.keys()));
        console.log("Node path map populated:", Array.from(nodePathMap.entries()));
      } else {
        md = "# No data available";
        console.error("No mindmap data provided");
      }
      
      const { root } = transformer.transform(md);
      
      // Current theme-based colors
      const isDark = resolvedTheme === 'dark';
      
      // Create the markmap with theme matching the app
      const mm = Markmap.create(svgRef.current, {
        autoFit: true,
        initialExpandLevel: 2,
        color: (node: INode) => {
          // Check if node is a resource node (starts with 📺)
          const isResourceNode = node.content.includes('📺') || node.content.includes('📝');
          
          if (isResourceNode) {
            // Use a different color for resource nodes
            return isDark ? '#10b981' : '#059669'; // Different green shades for dark/light
          }
          
          // Use gradient colors for topics based on theme
          const darkColors = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#e879f9'];
          const lightColors = ['#4f46e5', '#7c3aed', '#9333ea', '#c026d3', '#d946ef'];
          
          const colors = isDark ? darkColors : lightColors;
          const depth = node.state?.depth || 0;
          return colors[Math.min(depth, colors.length - 1)];
        },
        paddingX: 16,
        duration: 500,
        // Use a simple empty style as we'll apply styles separately
        style: (id) => { return ''; }
      }, root);

      // Store the reference
      markmapRef.current = mm;
      
      // Apply styles initially
      applyStyles();
      
      initializedRef.current = true;

    } catch (error) {
      console.error("Error creating mindmap:", error);
    }
    
    // Create and attach the enhanced click handler
    const handleNodeClick = createClickHandler(onLeafClick);
    
    // Ensure we clean up and re-attach the click handler
    if (svgRef.current) {
      // Remove any existing handler first
      svgRef.current.removeEventListener('click', handleNodeClick);
      // Add the new handler
      svgRef.current.addEventListener('click', handleNodeClick);
      
      console.log("Enhanced click event listener attached to SVG element");
    } else {
      console.warn("svgRef.current is null, couldn't attach click handler");
    }
    
    // Handle window resize
    const handleResize = () => {
      if (markmapRef.current) {
        markmapRef.current.fit();
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (svgRef.current) {
        svgRef.current.removeEventListener('click', handleNodeClick);
      }
      // Don't destroy the markmap when unmounting for theme switch
      // We'll let React handle this properly
    };
  }, [data, onLeafClick]); // Removed theme dependency

  // Separate effect for theme changes that only updates styles
  useEffect(() => {
    // Only update styles if mindmap exists
    if (markmapRef.current && svgRef.current) {
      applyStyles();
    }
  }, [resolvedTheme]); // Only depend on theme changes

  // Function to apply styles based on current theme
  function applyStyles() {
    if (!svgRef.current) return;
    
    // Get current theme state
    const isDark = resolvedTheme === 'dark';
    
    // Apply text styles directly to elements
    svgRef.current.querySelectorAll('.markmap-node-text').forEach(el => {
      const svgEl = el as SVGElement;
      svgEl.setAttribute('fill', isDark ? '#ffffff' : '#1e293b');
      svgEl.setAttribute('font-size', '14px');
      svgEl.setAttribute('font-weight', '500');
      
      // Check if this is a resource node and style it differently
      const text = svgEl.textContent || '';
      if (text.includes('📺') || text.includes('📝')) {
        svgEl.setAttribute('font-style', 'italic');
      }
    });

    // Style links
    svgRef.current.querySelectorAll('.markmap-link').forEach(el => {
      const svgEl = el as SVGElement;
      svgEl.setAttribute('stroke', isDark ? '#6366f1' : '#4f46e5');
      svgEl.setAttribute('stroke-width', '1.5px');
      svgEl.setAttribute('stroke-opacity', '0.75');
    });
  };

  const handleReturnToTree = () => {
    setShowVideoChat(false);
  };

  const handleZoomIn = useCallback(() => {
    if (markmapRef.current) {
      markmapRef.current.rescale(zoomLevel + 0.2);
      setZoomLevel(prev => prev + 0.2);
    }
  }, [zoomLevel]);

  const handleZoomOut = useCallback(() => {
    if (markmapRef.current) {
      markmapRef.current.rescale(Math.max(0.3, zoomLevel - 0.2));
      setZoomLevel(prev => Math.max(0.3, prev - 0.2));
    }
  }, [zoomLevel]);

  const handleReset = useCallback(() => {
    if (markmapRef.current) {
      markmapRef.current.fit();
      setZoomLevel(1);
    }
  }, []);

  const toggle3DView = useCallback(() => {
    setIs3DView(prev => !prev);
  }, []);

  return (
    <div className="relative h-full w-full flex flex-col">
      {/* 3D perspective wrapper */}
      <div 
        className={`relative flex-1 transition-all duration-500 overflow-hidden rounded-xl border border-gray-300 dark:border-zinc-700 bg-gray-100/80 dark:bg-zinc-800/50 backdrop-blur-sm shadow-lg ${is3DView ? 'transform-style-3d perspective-1000' : ''}`}
      >
        {/* Animated background */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 opacity-80">
          <div className="absolute inset-0 opacity-20 bg-grid-gray-300 dark:bg-grid-zinc-600/20 bg-[size:20px_20px]"></div>
        </div>
        
        {/* SVG container with 3D transformation when enabled */}
        <div 
          className={`relative z-10 w-full h-full transition-transform duration-500 ${
            is3DView ? 'transform rotate3d(1, 0, 0, 20deg)' : ''
          }`}
        >
          <svg 
            ref={svgRef} 
            className="w-full h-full" 
            style={{
              cursor: 'pointer',
              fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
              fontWeight: 500,
              fill: resolvedTheme === 'dark' ? '#ffffff' : '#1e293b',
              color: resolvedTheme === 'dark' ? '#ffffff' : '#1e293b'
            }}
          />
        </div>
        
        {/* Controls overlay */}
        <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2 bg-white/90 dark:bg-zinc-800/90 p-2 rounded-lg border border-gray-300 dark:border-zinc-700 shadow-lg">
          <button 
            onClick={handleZoomIn} 
            className="p-2 rounded-md hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-500 text-gray-700 dark:text-zinc-300 hover:text-white transition-colors"
            aria-label="Zoom in"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="11" y1="8" x2="11" y2="14"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </button>
          <button 
            onClick={handleZoomOut}
            className="p-2 rounded-md hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 text-zinc-300 hover:text-white transition-colors"
            aria-label="Zoom out"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </button>
          <button 
            onClick={handleReset}
            className="p-2 rounded-md hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 text-zinc-300 hover:text-white transition-colors"
            aria-label="Reset view"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
            </svg>
          </button>
          <div className="border-t border-zinc-700 my-1"></div>
          <button 
            onClick={toggle3DView}
            className={`p-2 rounded-md transition-colors ${
              is3DView 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' 
                : 'text-zinc-300 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 hover:text-white'
            }`}
            aria-label="Toggle 3D view"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3L2 12h3v8h14v-8h3L12 3z"></path>
              <path d="M12 8v13"></path>
            </svg>
          </button>
        </div>
        
        {/* Short instruction text */}
        <div className="absolute top-4 left-4 z-20 bg-white/80 dark:bg-zinc-900/80 text-xs text-gray-700 dark:text-zinc-400 py-1 px-2 rounded border border-gray-300 dark:border-zinc-700 backdrop-blur-sm">
          Click topics to expand/collapse. Click 📺 resource nodes to view content.
        </div>
      </div>
    </div>
  );
}

export default MindMap