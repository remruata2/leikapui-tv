// src/components/VideoPlayer/VideoPlayer.js
import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import Hls from "hls.js";
import { Video, VideoPlayer } from "@enact/sandstone/VideoPlayer";

const BUNNY_CDN_HOSTNAME = "vz-ec1fe7d3-1f4.b-cdn.net";

const resolveSourceUrl = (src) => {
	if (!src) return "";
	const trimmed = String(src).trim();
	if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
		return trimmed;
	}
	// If it's a Bunny video ID / GUID
	return `https://${BUNNY_CDN_HOSTNAME}/${trimmed}/playlist.m3u8`;
};

const VideoPlayerComponent = ({ source, onClose }) => {
	const videoPlayerRef = useRef(null);
	const resolvedSource = resolveSourceUrl(source);

	const isM3u8 = Boolean(
		resolvedSource &&
			(resolvedSource.includes(".m3u8") || resolvedSource.includes("/playlist"))
	);

	// Determine correct source type based on file extension
	const getSourceType = (url) => {
		if (url && url.endsWith(".m3u8")) {
			return "application/x-mpegURL";
		}
		return "video/mp4";
	};

	useEffect(() => {
		if (!resolvedSource) return;

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
					hls.loadSource(resolvedSource);
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
					video.src = resolvedSource;
					video.play().catch(() => {});
				}
			} else {
				if (!video.src || video.src !== resolvedSource) {
					video.src = resolvedSource;
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
	}, [resolvedSource, isM3u8]);

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
				width: "100%",
				height: "100%",
				overflow: "hidden"
			}}
			// Handle back button press
			onBack={onClose}
		>
			<Video
				style={{
					width: "100%",
					height: "100%",
					objectFit: "contain",
					objectPosition: "center"
				}}
			>
				{!isM3u8 && <source src={resolvedSource} type={getSourceType(resolvedSource)} />}
			</Video>
		</VideoPlayer>
	);
};

VideoPlayerComponent.propTypes = {
	onClose: PropTypes.func,
	source: PropTypes.string
};

export default VideoPlayerComponent;
