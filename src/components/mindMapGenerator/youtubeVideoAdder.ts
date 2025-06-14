// This Function Accepts a List of Topics in a chapter and return a map that maps each topic with some youtube video links with title and additional metadata

interface TopicWithVideo {
  title: string;
  youtubeVideos: YoutubeVideo[];
}

interface YoutubeVideo {
  title: string;
  url: string;
  length: string;   // Duration of video in format "HH:MM:SS"
  views: string;    // Number of views, formatted (e.g., "1.2M")
  likes: string;    // Number of likes, formatted (e.g., "45K")
}

// YouTube API configuration
const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const MAX_RESULTS = 5;

export const youtubeVideoAdder = async (topicList: string[]): Promise<TopicWithVideo[]> => {
  // Process topics in parallel
  const promises = topicList.map(async (topic) => {
    try {
      // First, search for videos
      const searchResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(topic)}&maxResults=${MAX_RESULTS}&type=video&key=${API_KEY}`
      );
      
      if (!searchResponse.ok) {
        throw new Error(`YouTube search API error: ${searchResponse.status}`);
      }
      
      const searchData = await searchResponse.json();
      
      // Extract video IDs for the second request
      const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
      
      // Second request to get video statistics and contentDetails (for duration)
      const videoDetailsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${API_KEY}`
      );
      
      if (!videoDetailsResponse.ok) {
        throw new Error(`YouTube video details API error: ${videoDetailsResponse.status}`);
      }
      
      const videoDetailsData = await videoDetailsResponse.json();
      
      // Create a map of video details for easy lookup
      const videoDetailsMap = new Map();
      videoDetailsData.items.forEach((item: any) => {
        videoDetailsMap.set(item.id, {
          duration: formatDuration(item.contentDetails.duration),
          views: formatCount(item.statistics.viewCount || "0"),
          likes: formatCount(item.statistics.likeCount || "0")
        });
      });
      
      // Combine search results with video details
      const youtubeVideos: YoutubeVideo[] = searchData.items.map((item: any) => {
        const videoId = item.id.videoId;
        const details = videoDetailsMap.get(videoId) || {
          duration: "Unknown",
          views: "N/A",
          likes: "N/A"
        };
        
        return {
          title: item.snippet.title,
          url: `https://www.youtube.com/watch?v=${videoId}`,
          length: details.duration,
          views: details.views,
          likes: details.likes
        };
      });
      
      // Fall back to dummy video if no results
      if (youtubeVideos.length === 0) {
        youtubeVideos.push({
          title: `Video for ${topic}`,
          url: `https://www.youtube.com/watch?v=dummy_video_for_${encodeURIComponent(topic)}`,
          length: "10:00",
          views: "1K",
          likes: "100"
        });
      }
      
      return {
        title: topic,
        youtubeVideos,
      };
    } catch (error) {
      console.error(`Error fetching videos for topic "${topic}":`, error);
      
      // Return topic with dummy video in case of error
      return {
        title: topic,
        youtubeVideos: [
          {
            title: `Video for ${topic}`,
            url: `https://www.youtube.com/watch?v=dummy_video_for_${encodeURIComponent(topic)}`,
            length: "10:00",
            views: "1K",
            likes: "100"
          },
        ],
      };
    }
  });
  
  // Wait for all API requests to complete
  return Promise.all(promises);
};

// Log the API key (be careful not to commit this to public repos)
console.log("API Key available:", !!API_KEY);

/**
 * Formats ISO 8601 duration to human-readable format (HH:MM:SS)
 * @param isoDuration ISO 8601 duration string (e.g., PT1H30M15S)
 */
function formatDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "Unknown";
  
  const hours = match[1] ? match[1].padStart(2, '0') + ':' : '';
  const minutes = (match[2] || '0').padStart(2, '0');
  const seconds = (match[3] || '0').padStart(2, '0');
  
  return `${hours}${minutes}:${seconds}`;
}

/**
 * Formats large numbers to human-readable format
 * @param count Number as string
 */
function formatCount(count: string): string {
  const num = parseInt(count, 10);
  if (isNaN(num)) return "N/A";
  
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}
