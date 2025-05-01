import { useEffect } from "react";
import VideoPlayerComponent from "../components/VideoPlayer/VideoPlayer";
import Button from "@enact/sandstone/Button";
import { IoClose } from "react-icons/io5";
import Spotlight from "@enact/spotlight";

const VideoPlayerPanel = ({ videoUrl, onClose }) => {
	// Handle keyboard navigation
	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === "Escape") {
				onClose();
			}
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [onClose]);

	// Focus the video player when mounted
	useEffect(() => {
		const focusVideoPlayer = () => {
			const videoPlayerElement = document.querySelector(
				'[data-spotlight-id="sandstone-video-player"]'
			);
			if (videoPlayerElement) {
				Spotlight.focus(videoPlayerElement);
			}
		};

		// Give the player time to render before focusing
		setTimeout(focusVideoPlayer, 300);
	}, []);

	return (
		<div
			data-spotlight-id="video-player-panel"
			style={{ width: "100vw", height: "100vh", background: "#000" }}
		>
			<VideoPlayerComponent source={videoUrl} />
			<Button
				onClick={onClose}
				data-spotlight-id="close-video-button"
				spotlightId="close-video-button"
				backgroundOpacity="transparent"
				size="large"
				style={{
					position: "absolute",
					top: 20,
					right: 20,
					zIndex: 10000,
					color: "white",
					border: "2px solid rgba(255,255,255,0.5)",
					backgroundColor: "rgba(0,0,0,0.5)",
					borderRadius: "50%",
					padding: "8px",
					outline: "none",
				}}
				tabIndex={0}
			>
				<IoClose size={24} />
			</Button>
		</div>
	);
};

export default VideoPlayerPanel;
