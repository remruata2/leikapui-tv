import { useEffect, useState, useCallback } from "react";
import Scroller from "@enact/sandstone/Scroller";
import Spotlight from "@enact/spotlight";
import SpotlightContainerDecorator from "@enact/spotlight/SpotlightContainerDecorator";
import MediaCard from "../Common/MediaCard";
import css from "./MoviesCarousel.module.less";

const MoviesCarousel = ({ setPanelIndex, setSelectedMovieId }) => {
	const [items, setItems] = useState([]);

	useEffect(() => {
		let isMounted = true;
		fetch(`${process.env.REACT_APP_API_URL}/api/movies`)
			.then((response) => response.json())
			.then((data) => {
				if (isMounted && data && Array.isArray(data.data)) {
					setItems(data.data);
				}
			})
			.catch((error) => console.error("Error fetching movies:", error));

		return () => {
			isMounted = false;
		};
	}, []);

	const handleSelect = useCallback(
		(id) => {
			if (!id) return;
			setSelectedMovieId(id);
			setPanelIndex(1);
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
					{items.map((movie, index) => (
						<MediaCard
							key={movie._id || index}
							poster={movie.horizontal_poster || movie.vertical_poster}
							title={movie.title}
							subtitle={movie.duration || (movie.genres ? movie.genres.split(",")[0] : null)}
							spotlightId={`movie-card-${index}`}
							onSpotlightLeft={index === 0 ? handleLeftmostSpotlightLeft : undefined}
							onClick={() => handleSelect(movie._id)}
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

export default CarouselDecorator(MoviesCarousel);
