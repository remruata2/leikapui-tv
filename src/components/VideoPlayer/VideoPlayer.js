// src/components/VideoPlayer/VideoPlayer.js
import React from "react";
import { Video, VideoPlayer } from "@enact/sandstone/VideoPlayer";

const VideoPlayerComponent = ({ source, onClose }) => {
	if (!source) {
		return <div>Loading...</div>;
	}

	// Determine correct source type based on file extension
	const getSourceType = (url) => {
		if (url && url.endsWith(".m3u8")) {
			return "application/x-mpegURL";
		} else {
			return "video/mp4";
		}
	};

	return (
		<VideoPlayer
			autoCloseTimeout={0}
			autoPlay
			controls
			feedbackHideDelay={3000}
			muted={false}
			spotlightDisabled={false}
			title=""
			data-spotlight-id="sandstone-video-player"
			style={{
				width: "100vw",
				height: "100vh",
				overflow: "hidden",
				zIndex: 10,
			}}
			// Handle back button press
			onBack={onClose}
		>
			<Video style={{ width: "100vw", height: "100vh", zIndex: 15 }}>
				<source src={source} type={getSourceType(source)} />
			</Video>
		</VideoPlayer>
	);
};

export default VideoPlayerComponent;
