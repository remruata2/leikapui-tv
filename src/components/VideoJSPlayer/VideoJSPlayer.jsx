import { useRef, useEffect } from "react";
import videojs from "video.js";
import "videojs-youtube";
import styles from "./VideoJSPlayer.module.css";
import Spotlight from "@enact/spotlight"; // For focus control

const SPOTLIGHT_ID = "videojs-player-spotlight";

const VideoJSPlayer = ({ options, onReady, style }) => {
	const videoRef = useRef(null);
	const playerRef = useRef(null);

	useEffect(() => {
		// Set Enact Spotlight focus to the player when mounted
		setTimeout(() => {
			Spotlight.focus(SPOTLIGHT_ID);
		}, 100); // Delayed focus to ensure DOM is ready

		if (!playerRef.current) {
			const videoElement = document.createElement("video-js");
			videoElement.classList.add("vjs-big-play-centered");
			videoElement.setAttribute("data-spotlight-id", "video-player");
			videoElement.setAttribute("tabindex", "0");
			videoRef.current.appendChild(videoElement);

			const player = (playerRef.current = videojs(videoElement, options, () => {
				if (onReady) onReady(player);
			}));

			// Make the player container focusable
			const playerContainer = videoElement.parentElement;
			playerContainer.setAttribute("tabindex", "0");
			playerContainer.setAttribute(
				"data-spotlight-id",
				"video-player-container"
			);

			// Add keyboard/remote event handlers to the player
			playerContainer.addEventListener("keydown", (e) => {
				switch (e.keyCode) {
					case 13: // Enter - toggle play/pause
						if (player.paused()) {
							player.play();
						} else {
							player.pause();
						}
						break;
					case 37: // Left Arrow - rewind
						player.currentTime(Math.max(0, player.currentTime() - 10));
						break;
					case 39: // Right Arrow - forward
						player.currentTime(player.currentTime() + 10);
						break;
					case 38: // Up Arrow - volume up
						player.volume(Math.min(1, player.volume() + 0.1));
						break;
					case 40: // Down Arrow - volume down
						player.volume(Math.max(0, player.volume() - 0.1));
						break;
					case 27: // Escape - exit fullscreen
						if (player.isFullscreen()) {
							player.exitFullscreen();
						}
						break;
				}
			});

			// Set focus to the player when loaded
			setTimeout(() => {
				if (playerContainer) {
					Spotlight.focus(playerContainer);
				}
			}, 100);

			// Ensure all controls are focusable
			setTimeout(() => {
				const controlBar =
					videoElement.parentElement.querySelector(".vjs-control-bar");
				if (controlBar) {
					controlBar.setAttribute("data-spotlight-id", "video-controls");
					controlBar.setAttribute("tabindex", "0");

					// Make all control buttons focusable
					const buttons = controlBar.querySelectorAll(".vjs-button, .vjs-control");
					buttons.forEach((btn, index) => {
						btn.setAttribute("data-spotlight-id", `video-control-${index}`);
						btn.setAttribute("tabindex", "0");

						// Add extra visual focus indication when focused
						btn.addEventListener("focus", () => {
							btn.style.boxShadow = "0 0 0 2px white";
						});
						btn.addEventListener("blur", () => {
							btn.style.boxShadow = "none";
						});
					});

					// Make progress bar focusable
					const progressControl = controlBar.querySelector(".vjs-progress-control");
					if (progressControl) {
						progressControl.setAttribute("data-spotlight-id", "video-progress");
						progressControl.setAttribute("tabindex", "0");
					}

					// Focus the play button by default
					const playButton = controlBar.querySelector(".vjs-play-control");
					if (playButton) {
						playButton.focus();
					}
				}
			}, 200);
		} else if (
			options.sources &&
			options.sources.length > 0 &&
			options.sources[0].src
		) {
			playerRef.current.src(options.sources);
			playerRef.current.play();
		}
	}, [options, onReady]);

	useEffect(() => {
		const player = playerRef.current;
		return () => {
			if (player && !player.isDisposed()) {
				player.dispose();
				playerRef.current = null;
			}
		};
	}, []);

	return (
		<div
			data-vjs-player
			tabIndex={0}
			className={styles.videoJsPlayer}
			style={style}
			spotlightId={SPOTLIGHT_ID}
			role="application"
			aria-label="Video Player"
		>
			<div ref={videoRef} style={{ width: "100%", height: "100%" }} />
		</div>
	);
};

export default VideoJSPlayer;
