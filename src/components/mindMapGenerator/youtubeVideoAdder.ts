// This Function Accepts a List of Topics in a chapter and return a map that maps each topic with some youtube video links with title and description

interface TopicWithVideo {
  title: string;
  youtubeVideos: youtubeVideo[];
}

interface youtubeVideo {
  title: string;
  description: string;
  url: string;
}

// YouTube API configuration
const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const MAX_RESULTS = 5;

export const youtubeVideoAdder = async (topicList: string[]): Promise<TopicWithVideo[]> => {
  // Process topics in parallel
  const promises = topicList.map(async (topic) => {
    try {
      // Fetch videos from YouTube API
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(topic)}&maxResults=${MAX_RESULTS}&type=video&key=${API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Convert API response to our youtubeVideo format
      const youtubeVideos: youtubeVideo[] = data.items.map((item: any) => ({
        title: item.snippet.title,
        description: item.snippet.description,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      }));
      
      // Fall back to dummy video if no results or error
      if (youtubeVideos.length === 0) {
        youtubeVideos.push({
          title: `Video for ${topic}`,
          description: `Description for ${topic}`,
          url: `https://www.youtube.com/watch?v=dummy          npx ts-node src/components/mindMapGenerator/checker.ts          npx ts-node src/components/mindMapGenerator/checker.ts          npx ts-node src/components/mindMapGenerator/checker.ts          npx ts-node src/components/mindMapGenerator/checker.ts_video_for_${encodeURIComponent(topic)}`,
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
            description: `Description for ${topic}`,
            url: `https://www.youtube.com/watch?v=dummy_video_for_${encodeURIComponent(topic)}`,
          },
        ],
      };
    }
  });
  
  // Wait for all API requests to complete
  return Promise.all(promises);
};
