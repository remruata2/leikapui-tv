import React, { useCallback } from "react";
import Spottable from "@enact/spotlight/Spottable";
import Spotlight from "@enact/spotlight";
import { FaPlay } from "react-icons/fa";
import css from "./HeroMetadata.module.less";

const SpottableButton = Spottable("div");

const HeroMetadata = ({ item, onPlay, index }) => {
	const handlePlaySpotlightLeft = useCallback((ev) => {
		ev.preventDefault();
		ev.stopPropagation();
		const sidebarTarget = document.querySelector('[data-spotlight-id="sidebar-item-0"]');
		if (sidebarTarget) {
			if (!Spotlight.focus(sidebarTarget)) {
				sidebarTarget.focus?.();
			}
		} else {
			Spotlight.focus("sidebar-item-0");
		}
	}, []);

	if (!item) return null;

	const isTvShow = item.type === "tv-show";
	const firstGenre = item.genres ? item.genres.split(",")[0]?.trim() : null;

	return (
		<div className={css.metadataContainer} data-spotlight-id="hero-metadata">
			<div className={css.metaLine}>
				<span className={css.typeTag}>{isTvShow ? "TV Series" : "Movie"}</span>
				{item.duration && (
					<>
						<span className={css.separator}>•</span>
						<span>{item.duration}</span>
					</>
				)}
				{firstGenre && (
					<>
						<span className={css.separator}>•</span>
						<span>{firstGenre}</span>
					</>
				)}
				<span className={css.separator}>•</span>
				<span className={css.hdBadge}>1080p FULL HD</span>
			</div>

			<h1 className={css.title}>{item.title}</h1>

			{item.description && (
				<p className={css.description}>{item.description}</p>
			)}

			<div className={css.actionsRow}>
				<SpottableButton
					className={css.playButton}
					onClick={onPlay}
					onSpotlightLeft={handlePlaySpotlightLeft}
					spotlightId={`banner-play-btn-${index}`}
					data-spotlight-id={`banner-play-btn-${index}`}
					tabIndex={0}
				>
					<span className={css.btnIcon}>
						<FaPlay />
					</span>
					<span>Watch Now</span>
				</SpottableButton>
			</div>
		</div>
	);
};

export default React.memo(HeroMetadata);
