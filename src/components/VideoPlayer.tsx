import React from 'react';
import ReactPlayer from 'react-player';
import { useVideoPlayer } from '@/context/VideoPlayerContext';

interface VideoPlayerProps {
  url: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url }) => {
  const { updatePosition } = useVideoPlayer();

  const handleProgress = (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => {
    updatePosition({
      played: state.played,
      playedSeconds: state.playedSeconds
    });
    console.log(`Video progress: ${Math.floor(state.playedSeconds)} seconds`);
  };

  return (
    <div className='player-wrapper' style={{ 
      position: 'relative', 
      paddingTop: '56.25%' /* 16:9 aspect ratio */,
      height: '0' /* Height will be determined by the aspect ratio */,
      width: '100%',
      background: '#000',
      marginBottom: '1rem' /* Add some spacing below the video */
    }}>
      <ReactPlayer
        url={url}
        className='react-player'
        playing={false}
        controls={true}
        width='100%'
        height='100%'
        style={{ position: 'absolute', top: 0, left: 0 }}
        light={true}
        onProgress={handleProgress}
        progressInterval={1000} // Update progress every 1 second
        config={{
          youtube: {
            playerVars: { 
              showinfo: 1,
              controls: 1,
              cc_load_policy: 1
            }
          }
        }}
      />
    </div>
  );
};

export default VideoPlayer;
