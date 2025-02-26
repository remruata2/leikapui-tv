import { useEffect, useRef } from "react";
import css from "./YouTubePlayer.module.less";

// Keep track of script loading state
let isYouTubeScriptLoaded = false;

const YouTubePlayer = ({ videoId }) => {
	const playerRef = useRef(null);
	const playerInstanceRef = useRef(null);

	useEffect(() => {
		// Function to initialize the player
		const initializePlayer = () => {
			if (!playerRef.current) return;

			playerInstanceRef.current = new window.YT.Player(playerRef.current, {
				videoId: videoId,
				playerVars: {
					autoplay: 0,
					controls: 1,
					modestbranding: 1,
					rel: 0,
					showinfo: 1,
				},
				events: {
					onReady: () => {
						// Player is ready
						console.log("YouTube Player is ready");
					},
					onError: (error) => {
						console.error("YouTube Player Error:", error);
					},
				},
			});
		};

		// Function to load the YouTube API
		const loadYouTubeScript = () => {
			if (isYouTubeScriptLoaded) {
				// If script is already loaded, initialize player directly
				if (window.YT && window.YT.Player) {
					initializePlayer();
				} else {
					// If YT object is not ready yet, wait for it
					window.onYouTubeIframeAPIReady = initializePlayer;
				}
				return;
			}

			// Create script only if it hasn't been created before
			const tag = document.createElement("script");
			tag.src = "https://www.youtube.com/iframe_api";
			tag.async = true;
			const firstScriptTag = document.getElementsByTagName("script")[0];
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

			// Set up the callback for when API is ready
			window.onYouTubeIframeAPIReady = () => {
				isYouTubeScriptLoaded = true;
				initializePlayer();
			};
		};

		loadYouTubeScript();

		// Cleanup function
		return () => {
			if (playerInstanceRef.current) {
				try {
					playerInstanceRef.current.destroy();
				} catch (error) {
					console.error("Error destroying YouTube player:", error);
				}
			}
			playerInstanceRef.current = null;
		};
	}, [videoId]);

	return (
		<div className={css.youtubeContainer}>
			<div ref={playerRef} />
		</div>
	);
};

export default YouTubePlayer;
