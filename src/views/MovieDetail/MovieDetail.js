import React, { useEffect, useState } from "react";
import Button from "@enact/sandstone/Button";
import SpotlightContainerDecorator from "@enact/spotlight/SpotlightContainerDecorator";
import { Popup } from "@enact/sandstone/Popup";
import { Header } from "@enact/sandstone/Panels";
import {
	FaUserCircle,
	FaShoppingCart,
	FaClock,
	FaExclamationCircle,
} from "react-icons/fa";
import { MdPlayCircleFilled, MdLocalMovies } from "react-icons/md";
import { StorageService } from "../../utils/storage";
import VideoJSPlayer from "../../components/VideoJSPlayer/VideoJSPlayer";
import VideoPlayerComponent from "../../components/VideoPlayer/VideoPlayer";
import Spotlight from "@enact/spotlight";
import css from "./MovieDetail.module.less";

const MovieDetailBase = ({
	selectedMovieId,
	setPanelIndex,
	setVideoPlayerActive,
}) => {
	const [movie, setMovie] = useState(null);
	const [user, setUser] = useState(null);
	const [purchaseStatus, setPurchaseStatus] = useState(null);
	const [showPlayer, setShowPlayer] = useState(false);
	const [showRentPopup, setShowRentPopup] = useState(false);

	// Ensure we cleanup video player state when component unmounts
	useEffect(() => {
		return () => {
			if (typeof setVideoPlayerActive === "function") {
				setVideoPlayerActive(false);
			}
		};
	}, [setVideoPlayerActive]);

	// Sync the showPlayer state with isVideoPlayerActive in App.js
	useEffect(() => {
		if (typeof setVideoPlayerActive === "function") {
			setVideoPlayerActive(showPlayer);
		}
	}, [showPlayer, setVideoPlayerActive]);

	useEffect(() => {
		const authData = StorageService.getItem("authData");
		if (authData?.user) {
			setUser(authData);
		}
	}, []);

	useEffect(() => {
		if (!selectedMovieId) return;
		fetch(`${process.env.REACT_APP_API_URL}/api/movies/${selectedMovieId}`)
			.then((response) => response.json())
			.then((data) => setMovie(data.data))
			.catch((error) => console.error("Error:", error));
	}, [selectedMovieId]);

	console.log("User Data:", user);
	console.log("Movie Data:", movie);

	useEffect(() => {
		if (user?.user && movie?._id) {
			fetch(
				`${process.env.REACT_APP_API_URL}/api/purchases/check/${movie._id}`,
				{
					headers: {
						Authorization: `Bearer ${user.token}`,
					},
				}
			)
				.then((response) => response.json())
				.then((data) => {
					if (data.hasAccess) {
						setPurchaseStatus({ hasAccess: true });
					} else {
						setPurchaseStatus({ hasAccess: false });
					}
				})
				.catch((error) => console.error("Error:", error));
		}
	}, [user, movie]);

	const handleLoginClick = () => {
		setPanelIndex && setPanelIndex(5);
	};

	const handleRentClick = () => {
		setShowRentPopup(true);
	};

	const handlePlay = () => {
		if (movie?.movie_url?.hlsUrl) {
			setShowPlayer(true);
			// Inform App.js that video player is active (for sidebar visibility)
			if (typeof setVideoPlayerActive === "function") {
				setVideoPlayerActive(true);
			}
			// Focus the video player after it's rendered
			setTimeout(() => {
				const videoPlayer = document.querySelector(
					'[data-spotlight-id="sandstone-video-player"]'
				);
				if (videoPlayer) {
					Spotlight.focus(videoPlayer);
				}
			}, 300);
		} else {
			setShowRentPopup(true);
		}
	};

	const handleClosePlayer = () => {
		setShowPlayer(false);
		// Inform App.js that video player is no longer active
		if (typeof setVideoPlayerActive === 'function') {
			setVideoPlayerActive(false);
		}
		// Return focus to movie detail content
		const detailScroller = document.querySelector(
			'[data-spotlight-id="movie-detail-scroller"]'
		);
		if (detailScroller) {
			setTimeout(() => Spotlight.focus(detailScroller), 50);
		}
	};

	// Use trailer_url directly as YouTube video ID or URL
	const youtubeId = movie?.trailer_url;
	const videoUrl = movie?.movie_url?.hlsUrl;

	console.log("Video URL:", videoUrl);

	// Video.js YouTube player options
	const videoJsOptions = youtubeId
		? {
				autoplay: false,
				controls: true,
				responsive: true,
				fluid: true,
				techOrder: ["youtube"],
				sources: [
					{
						type: "video/youtube",
						src: `https://www.youtube.com/watch?v=${youtubeId}`,
					},
				],
				youtube: {
					iv_load_policy: 1,
					modestbranding: 1,
					rel: 0,
					showinfo: 0,
					playsinline: 1,
					enablejsapi: 1,
					origin: window.location.origin,
				},
		  }
		: null;

	const renderActionButton = () => {
		if (!user) {
			return (
				<Button className={css.loginButton} onClick={handleLoginClick}>
					<FaUserCircle className={css.buttonIcon} />
					Login to Watch
				</Button>
			);
		}
		if (purchaseStatus?.hasAccess) {
			return (
				<Button className={css.playButton} onClick={handlePlay}>
					<MdPlayCircleFilled className={css.buttonIcon} />
					Watch Now
				</Button>
			);
		}
		return (
			<Button className={css.rentButton} onClick={handleRentClick}>
				<FaShoppingCart className={css.buttonIcon} />
				Rent Now
			</Button>
		);
	};

	if (!movie) {
		return (
			<div className={css.loading}>
				<div className={css.spinner} />
				<span>Loading movie details...</span>
			</div>
		);
	}

	return (
		<div className={css.movieDetailContainer}>
			<div
				className={css.movieDetail}
				style={{ backgroundImage: `url(${movie.horizontal_poster})` }}
			>
				{/* Vertical Poster Section */}
				<div className={css.verticalPosterSection}>
					<img
						src={movie.vertical_poster}
						alt={movie.title + " Poster"}
						className={css.verticalPosterImg}
					/>
				</div>
				<div className={css.content}>
					<span className={css.movieTitle}>{movie.title}</span>

					<div className={css.badgeSection}>
						<div className={css.badge}>
							<FaClock className={css.icon} />
							<span className={css.tagText}>{movie.duration}</span>
						</div>
						<div className={css.badge}>
							<MdLocalMovies className={css.icon} />
							<span className={css.tagText}>
								{new Date(movie.release_date).getFullYear()}
							</span>
						</div>
					</div>

					<div className={css.genresSection}>
						{movie.genres.split(",").map((genre, index) => (
							<div key={index} className={css.genreTag}>
								{genre.trim()}
							</div>
						))}
					</div>
					<div className={css.actionSection}>{renderActionButton()}</div>

					<div className={css.descriptionSection}>
						<div className={css.summaryHeading}>
							<span>Summary</span>
						</div>
						<span className={css.summaryText}>{movie.description}</span>
					</div>

					<div className={css.metadataSection}>
						<div className={css.metadataItem}>
							<div>
								<span className={css.label}>Director</span>
								<div className={css.value}>{movie.director}</div>
							</div>
						</div>
						<div className={css.metadataItem}>
							<div>
								<div className={css.label}>Producer</div>
								<div className={css.value}>{movie.producer}</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			{/* Direct Video Player (without popup) */}
			{showPlayer && movie?.movie_url?.hlsUrl && (
				<div
					style={{
						position: "fixed",
						top: 0,
						left: 0,
						width: "100vw",
						height: "100vh",
						zIndex: 30, // Higher than sidebar (20) when video is not active
						background: "#000",
					}}
				>
					<VideoPlayerComponent 
						source={movie.movie_url.hlsUrl} 
						onClose={handleClosePlayer}
					/>
				</div>
			)}
			{/* Rent Popup */}
			<Popup
				open={showRentPopup}
				onClose={() => setShowRentPopup(false)}
				closeButton
				spotlightRestrict="self-only"
				style={{ padding: "2rem" }}
			>
				<div className={css.rentPopupContent}>
					<span>
						Please rent {movie.title} at website leikapuistudios.com or from
						mobile app so you can watch it here.
					</span>
					<div className={css.rentPopupButtons}>
						<Button onClick={() => setShowRentPopup(false)}>Close</Button>
					</div>
				</div>
			</Popup>
		</div>
	);
};

const MovieDetail = SpotlightContainerDecorator(
	{ enterTo: "default-element" },
	MovieDetailBase
);

export default MovieDetail;
