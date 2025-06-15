import { NextResponse } from 'next/server';
import { Innertube, UniversalCache } from 'youtubei.js';

interface YoutubeVideo {
  title: string;
  url: string;
  length: string;
  views: string;
  likes: string;
}

interface TopicWithVideo {
  title: string;
  youtubeVideos: YoutubeVideo[];
}

const MAX_RESULTS = 5;

export async function POST(request: Request) {
  try {
    const { topics } = await request.json();
    
    if (!Array.isArray(topics)) {
      return NextResponse.json({ error: 'Topics must be an array' }, { status: 400 });
    }
    
    const youtube = await Innertube.create({ cache: new UniversalCache(false) });
    
    const results = await Promise.all(topics.map(async (topic) => {
      try {
        const search = await youtube.search(topic);
        
        const youtubeVideos: YoutubeVideo[] = [];
        for (const item of search.videos) {
          if (
            item &&
            (item as any).type === 'Video' &&
            typeof (item as any).id === 'string' &&
            typeof (item as any).title?.text === 'string'
          ) {
            const video = item as any;
            youtubeVideos.push({
              title: video.title.text,
              url: `https://www.youtube.com/watch?v=${video.id}`,
              length: video.duration?.text ?? 'Unknown',
              views: video.view_count?.text ?? 'N/A',
              likes: video.like_count?.short_text ?? 'N/A',
            });
          }
          if (youtubeVideos.length >= MAX_RESULTS) break;
        }
        
        if (youtubeVideos.length === 0) {
          youtubeVideos.push({
            title: `No video found for "${topic}"`,
            url: '#',
            length: '00:00',
            views: '0',
            likes: '0',
          });
        }
        
        return { title: topic, youtubeVideos };
      } catch (error) {
        console.error(`Error for ${topic}:`, error);
        return {
          title: topic,
          youtubeVideos: [
            {
              title: `Error fetching video`,
              url: '#',
              length: '00:00',
              views: '0',
              likes: '0',
            },
          ],
        };
      }
    }));
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
  }
}