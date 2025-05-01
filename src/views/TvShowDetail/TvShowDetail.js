import { useEffect, useState } from "react";
import Scroller from "@enact/ui/Scroller";
import Spottable from "@enact/spotlight/Spottable";
import ThemeDecorator from "@enact/sandstone/ThemeDecorator";
import Icon from "@enact/sandstone/Icon";
import { Panels, Panel } from "@enact/sandstone/Panels";
import VideoPlayerComponent from "../../components/VideoPlayer/VideoPlayer";
import css from "./TvShowDetail.module.less";

const FALLBACK_VIDEO =
	"http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4";

const TvShowBase = ({ selectedMovieId, setSidebarDisplay, setPanelIndex }) => {
	const [tvShow, setTvShow] = useState(null);
	const [index, setIndex] = useState(0);
	const [selectedSeason, setSelectedSeason] = useState(1);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	const SpottableButton = Spottable("button");
	const SpottableDiv = Spottable("div");

	useEffect(() => {
		if (!selectedMovieId) {
			setError("No TV show selected");
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		setError(null);

		fetch(`${process.env.REACT_APP_API_URL}/api/tvShows/${selectedMovieId}`)
			.then((response) => {
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				return response.json();
			})
			.then((data) => {
				if (!data) {
					throw new Error("No data received");
				}
				if (!Array.isArray(data.data.seasons)) {
					throw new Error("Invalid seasons data");
				}
				console.log(data.data);
				setTvShow(data.data);
				if (data.data.seasons.length > 0) {
					setSelectedSeason(data.data.seasons[0].season_no);
				}
			})
			.catch((error) => {
				console.error("Error:", error);
				setError(error.message);
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, [selectedMovieId]);

	const handlePlayButtonClick = () => {
		setIndex(1);
		setSidebarDisplay?.(false);
	};

	if (isLoading) {
		return (
			<div className={css.loading}>
				<Icon>loading</Icon>
				<span>Loading TV show details...</span>
			</div>
		);
	}

	if (error) {
		return (
			<div className={css.error}>
				<Icon>warning</Icon>
				<span>Error: {error}</span>
			</div>
		);
	}

	if (!tvShow || !Array.isArray(tvShow.seasons)) {
		return (
			<div className={css.error}>
				<Icon>warning</Icon>
				<span>No TV show data available</span>
			</div>
		);
	}

	const currentSeason =
		tvShow.seasons.find((s) => s.season_no === selectedSeason) ||
		tvShow.seasons[0];

	return (
		<Panels
			index={index}
			onSelectBreadcrumb={(e) => setIndex(e.index)}
			onBack={() => setPanelIndex((prev) => Math.max(prev - 1, 0))}
		>
			<Panel>
				<Scroller>
					<div
						className={css.tvShowDetail}
						style={{
							backgroundImage: tvShow.horizontal_poster
								? `url(${tvShow.horizontal_poster})`
								: undefined,
						}}
					>
						<div className={css.content}>
							<span className={css.tvShowTitle}>
								{tvShow.show_name || "Untitled Show"}
							</span>

							<div className={css.badgeSection}>
								{currentSeason?.duration && (
									<div className={css.badge}>
										<Icon className={css.icon}>timer</Icon>
										<span className={css.tagText}>
											{currentSeason.duration} min
										</span>
									</div>
								)}
								{tvShow.release_date && (
									<div className={css.badge}>
										<Icon className={css.icon}>guide</Icon>
										<span className={css.tagText}>
											{new Date(tvShow.release_date).getFullYear()}
										</span>
									</div>
								)}
								<div className={css.badge}>
									<Icon className={css.icon}>nowplaying</Icon>
									<span className={css.tagText}>
										{tvShow.seasons.length} Season
										{tvShow.seasons.length !== 1 ? "s" : ""}
									</span>
								</div>
							</div>

							{tvShow.genres && (
								<div className={css.genresSection}>
									{tvShow.genres.split(",").map((genre, index) => (
										<div key={index} className={css.genreTag}>
											{genre.trim()}
										</div>
									))}
								</div>
							)}

							{tvShow.description && (
								<div className={css.descriptionSection}>
									<div className={css.summaryHeading}>
										<span>Summary</span>
									</div>
									<span className={css.summaryText}>{tvShow.description}</span>
								</div>
							)}

							<div className={css.metadataSection}>
								{tvShow.casts && (
									<div className={css.metadataItem}>
										<div>
											<span className={css.label}>Cast</span>
											<div className={css.value}>{tvShow.casts}</div>
										</div>
									</div>
								)}
								{tvShow.status && (
									<div className={css.metadataItem}>
										<div>
											<div className={css.label}>Status</div>
											<div className={css.value}>{tvShow.status}</div>
										</div>
									</div>
								)}
							</div>

							{currentSeason && (
								<div className={css.seasonSection}>
									<div className={css.seasonHeader}>
										<span className={css.sectionTitle}>
											Season {selectedSeason}
										</span>
										<div className={css.seasonNav}>
											{tvShow.seasons.map((season) => (
												<SpottableButton
													key={season.season_no}
													className={`${css.seasonButton} ${
														selectedSeason === season.season_no
															? css.active
															: ""
													}`}
													onClick={() => setSelectedSeason(season.season_no)}
												>
													{season.season_no}
												</SpottableButton>
											))}
										</div>
									</div>
									{Array.isArray(currentSeason.episodes) &&
										currentSeason.episodes.length > 0 && (
											<div className={css.episodeList}>
												{currentSeason.episodes.map((episode) => (
													<SpottableDiv
														key={episode.episode_no}
														className={css.episodeItem}
														onClick={handlePlayButtonClick}
													>
														<div className={css.episodeNumber}>
															{episode.episode_no}
														</div>
														<div className={css.episodeInfo}>
															<div className={css.episodeTitle}>
																{episode.title ||
																	`Episode ${episode.episode_no}`}
															</div>
															{episode.duration && (
																<div className={css.episodeRuntime}>
																	{episode.duration} min
																</div>
															)}
														</div>
														<Icon className={css.playIcon}>playcircle</Icon>
													</SpottableDiv>
												))}
											</div>
										)}
								</div>
							)}
						</div>
					</div>
				</Scroller>
			</Panel>
			<Panel>
				<VideoPlayerComponent source={tvShow.trailer_url || FALLBACK_VIDEO} />
			</Panel>
		</Panels>
	);
};

const TvShow = ThemeDecorator(Spottable(TvShowBase));

export default TvShow;
