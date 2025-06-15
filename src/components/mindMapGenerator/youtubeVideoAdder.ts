"use client"

interface TopicWithVideo {
  title: string;
  youtubeVideos: YoutubeVideo[];
}

interface YoutubeVideo {
  title: string;
  url: string;
  length: string;
  views: string;
  likes: string;
}

export const youtubeVideoAdder = async (
  topicList: string[]
): Promise<TopicWithVideo[]> => {
  try {
    const response = await fetch('/api/youtube', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topics: topicList }),
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    
    // Return fallback data in case of error
    return topicList.map(topic => ({
      title: topic,
      youtubeVideos: [
        {
          title: `Error fetching videos for "${topic}"`,
          url: '#',
          length: '00:00',
          views: '0',
          likes: '0',
        },
      ],
    }));
  }
};
