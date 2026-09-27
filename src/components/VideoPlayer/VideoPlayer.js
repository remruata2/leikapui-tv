// src/components/VideoPlayer/VideoPlayer.js
import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import Hls from "hls.js";
import { Video, VideoPlayer } from "@enact/sandstone/VideoPlayer";

const VideoPlayerComponent = ({ source, onClose }) => {
	const videoPlayerRef = useRef(null);

	const isM3u8 = Boolean(
		source && (source.includes(".m3u8") || source.includes("/playlist"))
	);

	// Determine correct source type based on file extension
	const getSourceType = (url) => {
		if (url && url.endsWith(".m3u8")) {
			return "application/x-mpegURL";
		}
		return "video/mp4";
	};

	useEffect(() => {
		if (!source) return;

		let hlsInstance = null;
		let timeoutId = null;

		const getVideoElement = () => {
			const node = videoPlayerRef.current?.getVideoNode?.();
			if (node) {
				if (node.tagName && node.tagName.toLowerCase() === "video") return node;
				if (node.media && node.media.tagName && node.media.tagName.toLowerCase() === "video") return node.media;
				if (typeof node.querySelector === "function") {
					const v = node.querySelector("video");
					if (v) return v;
				}
			}
			return document.querySelector("video");
		};

		const setupPlayback = () => {
			const video = getVideoElement();
			if (!video) {
				timeoutId = setTimeout(setupPlayback, 50);
				return;
			}

			if (isM3u8) {
				if (Hls.isSupported()) {
					const hls = new Hls({
						enableWorker: true,
						lowLatencyMode: true,
						backBufferLength: 90
					});
					hls.loadSource(source);
					hls.attachMedia(video);
					hls.on(Hls.Events.MANIFEST_PARSED, () => {
						video.play().catch(() => {});
					});
					hls.on(Hls.Events.ERROR, (event, data) => {
						if (data.fatal) {
							switch (data.type) {
								case Hls.ErrorTypes.NETWORK_ERROR:
									hls.startLoad();
									break;
								case Hls.ErrorTypes.MEDIA_ERROR:
									hls.recoverMediaError();
									break;
								default:
									hls.destroy();
									break;
							}
						}
					});
					hlsInstance = hls;
				} else if (video.canPlayType("application/vnd.apple.mpegurl")) {
					video.src = source;
					video.play().catch(() => {});
				}
			} else {
				if (!video.src || video.src !== source) {
					video.src = source;
					video.play().catch(() => {});
				}
			}
		};

		setupPlayback();

		return () => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
			if (hlsInstance) {
				hlsInstance.destroy();
			}
		};
	}, [source, isM3u8]);

	if (!source) {
		return <div>Loading...</div>;
	}

	return (
		<VideoPlayer
			ref={videoPlayerRef}
			autoCloseTimeout={3000}
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
				zIndex: 10
			}}
			// Handle back button press
			onBack={onClose}
		>
			<Video style={{ width: "100vw", height: "100vh", zIndex: 15 }}>
				{!isM3u8 && <source src={source} type={getSourceType(source)} />}
			</Video>
		</VideoPlayer>
	);
};

VideoPlayerComponent.propTypes = {
	onClose: PropTypes.func,
	source: PropTypes.string
};

export default VideoPlayerComponent;
