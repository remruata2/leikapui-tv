import { useEffect, useState, useCallback } from "react";
import Scroller from "@enact/sandstone/Scroller";
import Spotlight from "@enact/spotlight";
import SpotlightContainerDecorator from "@enact/spotlight/SpotlightContainerDecorator";
import MediaCard from "../Common/MediaCard";
import css from "./TvShowsCarousel.module.less";

const TvShowsCarousel = ({ setPanelIndex, setSelectedMovieId }) => {
	const [items, setItems] = useState([]);

	useEffect(() => {
		let isMounted = true;
		fetch(`${process.env.REACT_APP_API_URL}/api/tvShows`)
			.then((response) => response.json())
			.then((data) => {
				if (isMounted && Array.isArray(data)) {
					setItems(data);
				}
			})
			.catch((error) => console.error("Error fetching tv shows:", error));

		return () => {
			isMounted = false;
		};
	}, []);

	const handleSelect = useCallback(
		(id) => {
			if (!id) return;
			setSelectedMovieId(id);
			setPanelIndex(2); // TV Show detail panel
		},
		[setPanelIndex, setSelectedMovieId]
	);

	const handleLeftmostSpotlightLeft = useCallback((ev) => {
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

	if (!items.length) {
		return null;
	}

	return (
		<div className={css.carouselWrapper}>
			<Scroller
				className={css.scroller}
				direction="horizontal"
				horizontalScrollbar="hidden"
				verticalScrollbar="hidden"
				focusableScrollbar={false}
				spotlightDisabled={false}
			>
				<div className={css.cardsRow}>
					{items.map((show, index) => (
						<MediaCard
							key={show._id || index}
							poster={show.horizontal_poster || show.vertical_poster}
							title={show.show_name || show.title}
							subtitle={
								show.seasons && show.seasons.length > 0
									? `${show.seasons.length} Season${show.seasons.length > 1 ? "s" : ""}`
									: show.duration
									? `${show.duration} min`
									: null
							}
							spotlightId={`tvshow-card-${index}`}
							onSpotlightLeft={index === 0 ? handleLeftmostSpotlightLeft : undefined}
							onClick={() => handleSelect(show._id)}
						/>
					))}
				</div>
			</Scroller>
		</div>
	);
};

const CarouselDecorator = SpotlightContainerDecorator({
	enterTo: "default-element",
	preserveId: true,
	continue5WayHold: true,
});

export default CarouselDecorator(TvShowsCarousel);
