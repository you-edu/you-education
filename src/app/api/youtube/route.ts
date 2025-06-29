import { NextResponse } from 'next/server';
import { Innertube, UniversalCache } from 'youtubei.js';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const videoUrl = url.searchParams.get('videoUrl');
    
    if (!videoUrl) {
      return NextResponse.json({ error: 'Video URL is required' }, { status: 400 });
    }
    
    // Extract video ID from URL
    const videoId = extractVideoId(videoUrl);
    
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }
    
    console.log(`Fetching video details for ID: ${videoId}`);
    
    // Disable caching like in the working mind maps route
    const youtube = await Innertube.create({ cache: new UniversalCache(false) });
    const videoInfo = await youtube.getInfo(videoId);
    
    console.log(`Successfully fetched video info for: ${videoInfo.basic_info.title}`);
    
    // Create response with data
    const response = NextResponse.json({
      title: videoInfo.basic_info.title || '',
      description: videoInfo.basic_info.short_description || '',
    });
    
    // Add cache-control headers for browsers and CDNs
    response.headers.set('Cache-Control', 'public, max-age=86400, s-maxage=86400'); // 24 hours
    
    return response;
  } catch (error) {
    console.error('API error:', error);
    
    // More detailed error logging for debugging
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    
    return NextResponse.json({ 
      error: 'Failed to fetch video details',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Function to extract video ID from various YouTube URL formats
function extractVideoId(url: string): string | null {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
}