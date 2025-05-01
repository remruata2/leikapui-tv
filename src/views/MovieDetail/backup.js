import { useEffect, useState } from "react";
import { BodyText } from "@enact/sandstone/BodyText";
import Scroller from "@enact/ui/Scroller";
import Spottable from "@enact/spotlight/Spottable";
import ThemeDecorator from "@enact/sandstone/ThemeDecorator";
import Button from "@enact/sandstone/Button";
import Spotlight from "@enact/spotlight";
import SpotlightContainerDecorator from "@enact/spotlight/SpotlightContainerDecorator";
import { Popup } from "@enact/sandstone/Popup";
import { Panel, Header } from "@enact/sandstone/Panels";
import {
	FaUserCircle,
	FaShoppingCart,
	FaClock,
	FaExclamationCircle,
} from "react-icons/fa";
import { MdPlayCircleFilled, MdLocalMovies } from "react-icons/md";
import VideoPlayerComponent from "../../components/VideoPlayer/VideoPlayer";
import YouTubePlayer from "../../components/YouTubePlayer/YouTubePlayer";
import { StorageService } from "../../utils/storage";
import css from "./MovieDetail.module.less";

const MovieDetailBase = ({ selectedMovieId, setPanelIndex }) => {
	const [movie, setMovie] = useState(null);
	const [showPlayer, setShowPlayer] = useState(false);
	const [showRentPopup, setShowRentPopup] = useState(false);
	const [user, setUser] = useState(null);
	const [purchaseStatus, setPurchaseStatus] = useState(null);

	const SpottableButton = Spottable(Button);

	useEffect(() => {
		const authData = StorageService.getItem("authData");
		if (authData?.user) {
			setUser(authData);
		}
	}, []);

	useEffect(() => {
		fetch(`${process.env.REACT_APP_API_URL}/api/movies/${selectedMovieId}`)
			.then((response) => response.json())
			.then((data) => setMovie(data.data))
			.catch((error) => console.error("Error:", error));
	}, [selectedMovieId]);

	useEffect(() => {
		if (user?.user && movie) {
			fetch(
				`${process.env.REACT_APP_API_URL}/api/transactions/check-payment/${movie._id}?userId=${user.user.id}`,
				{
					headers: {
						Authorization: `Bearer ${user.token}`,
					},
				}
			)
				.then((response) => response.json())
				.then((data) => {
					if (data.success) {
						setPurchaseStatus(data);
					}
				})
				.catch((error) => console.error("Error:", error));
		}
	}, [user, movie]);

	const getYouTubeId = (url) => {
		if (!url) return null;
		const regExp =
			/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
		const match = url.match(regExp);
		return match && match[2].length === 11 ? match[2] : null;
	};

	const handlePlayButtonClick = () => {
		setShowPlayer(true);
	};

	const handleClosePlayer = () => {
		setShowPlayer(false);
		// Return focus to movie detail content
		const detailScroller = document.querySelector(
			'[data-spotlight-id="movie-detail-scroller"]'
		);
		if (detailScroller) {
			setTimeout(() => Spotlight.focus(detailScroller), 50);
		}
	};

	const handleLoginClick = () => {
		setPanelIndex(5);
	};

	const handleRentClick = () => {
		setShowRentPopup(true);
	};

	const renderActionButton = () => {
		if (!user) {
			return (
				<SpottableButton className={css.loginButton} onClick={handleLoginClick}>
					<FaUserCircle className={css.buttonIcon} />
					Login to Watch
				</SpottableButton>
			);
		}

		if (purchaseStatus?.hasPaid) {
			return (
				<SpottableButton
					className={css.playButton}
					onClick={handlePlayButtonClick}
				>
					<MdPlayCircleFilled className={css.buttonIcon} />
					Watch Now
					{purchaseStatus.remainingTime && (
						<span className={css.remainingTime}>
							({purchaseStatus.remainingTime} left)
						</span>
					)}
				</SpottableButton>
			);
		}

		return (
			<SpottableButton className={css.rentButton} onClick={handleRentClick}>
				<FaShoppingCart className={css.buttonIcon} />
				Rent Now
			</SpottableButton>
		);
	};

	if (!movie) {
		return (
			<div
				className={css.loading}
				data-spotlight-id="movie-detail-scroller"
				tabIndex={-1}
			>
				<div className={css.spinner} />
				<BodyText>Loading movie details...</BodyText>
			</div>
		);
	}

	const youtubeId = getYouTubeId(movie.trailer_url);

	return (
		<div className={css.movieDetailContainer}>
			<Scroller
				style={{ height: "100%" }}
				data-spotlight-id="movie-detail-scroller"
			>
				<Header
					title={movie?.title}
					onBack={() => setPanelIndex((prev) => Math.max(prev - 1, 0))}
				/>
				<div
					className={css.movieDetail}
					style={{
						backgroundImage: `url(${movie.horizontal_poster})`,
					}}
				>
					<div className={css.trailerSection}>
						{youtubeId ? (
							<YouTubePlayer videoId={youtubeId} />
						) : (
							<div className={css.noTrailer}>
								<FaExclamationCircle className={css.warningIcon} />
								<span>No trailer available</span>
							</div>
						)}
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

						<div className={css.actionSection}>{renderActionButton()}</div>
					</div>
				</div>
			</Scroller>

			<Popup
				open={showPlayer}
				onClose={handleClosePlayer}
				closeButton
				spotlightRestrict="self-only"
				style={{ width: "100vw", height: "100vh" }}
			>
				<VideoPlayerComponent source={movie?.video_url} />
			</Popup>

			<Popup
				open={showRentPopup}
				onClose={() => setShowRentPopup(false)}
				closeButton
				spotlightRestrict="self-only"
				style={{ padding: "2rem" }}
			>
				<div className={css.rentPopupContent}>
					<BodyText>
						Please rent {movie.title} at mobile app so you can watch it here.
					</BodyText>
					<div className={css.rentPopupButtons}>
						<SpottableButton onClick={() => setShowRentPopup(false)}>
							Close
						</SpottableButton>
					</div>
				</div>
			</Popup>
		</div>
	);
};

const MovieDetail = SpotlightContainerDecorator(
	{
		enterTo: "default-element",
		defaultElement: '[data-spotlight-id="movie-detail-scroller"]',
		preserve: false,
	},
	ThemeDecorator(MovieDetailBase)
);

export default MovieDetail;
