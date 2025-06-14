import React from 'react';
import ReactPlayer from 'react-player';

interface VideoPlayerProps {
  url: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url }) => {
  return (
    <div className='player-wrapper' style={{ 
      position: 'relative', 
      paddingTop: '56.25%', // 16:9 aspect ratio
      height: '0',          // Height will be determined by the aspect ratio
      width: '100%',
      background: '#000',
      flex: '1 0 auto'      // Allows container to grow but not shrink
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
