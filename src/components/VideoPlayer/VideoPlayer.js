// src/components/VideoPlayer/VideoPlayer.js
import { Video, VideoPlayer } from "@enact/sandstone/VideoPlayer";

const VideoPlayerComponent = ({ source }) => {
  if (!source) {
    return <div>Loading...</div>;
  }

  return (
    <VideoPlayer
      style={{ width: "100%", maxWidth: "100%", overflow: "hidden" }}
    >
      <Video src={source} />
    </VideoPlayer>
  );
};

export default VideoPlayerComponent;
