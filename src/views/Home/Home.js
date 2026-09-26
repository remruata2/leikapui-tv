import css from "./Home.module.less";
import SpotlightContainerDecorator from "@enact/spotlight/SpotlightContainerDecorator";
import MoviesCarousel from "../../components/MoviesCarousel/MoviesCarousel";
import TvShowsCarousel from "../../components/TvShowsCarousel/TvShowsCarousel";
import Heading from "@enact/sandstone/Heading";
import Scroller from "@enact/sandstone/Scroller";
import HomeBanner from "../../components/HomeBanner/HomeBanner";
import SectionHeader from "../../components/Common/SectionHeader";
import { useEffect, useRef, useCallback, useState } from "react";
import Spotlight from "@enact/spotlight";

const Home = ({ setPanelIndex, setSelectedMovieId, panelIndex }) => {
	const [contentHeight, setContentHeight] = useState(0);
	const [hasMovies, setHasMovies] = useState(false);
	const [hasTvShows, setHasTvShows] = useState(false);
	const contentRef = useRef(null);
	const bannerRef = useRef(null);
	const isInitialMount = useRef(true);
	const scrollerRef = useRef(null);

 	// Check if API endpoints have data
 	useEffect(() => {
 		// Check for movies
 		fetch(`${process.env.REACT_APP_API_URL}/api/movies`)
 			.then((response) => response.json())
 			.then((data) => {
 				if (data && data.data && data.data.length > 0) {
 					setHasMovies(true);
 				}
 			})
 			.catch((error) => {
 				console.error("Error checking movies:", error);
 			});

 		// Check for TV shows
 		fetch(`${process.env.REACT_APP_API_URL}/api/tvShows`)
 			.then((response) => response.json())
 			.then((data) => {
 				if (data && data.length > 0) {
 					setHasTvShows(true);
 				}
 			})
 			.catch((error) => {
 				console.error("Error checking TV shows:", error);
 			});
 	}, []);

	// Use effect to handle initial focus and spotlight configuration
	useEffect(() => {
		// Set 5-way mode
		Spotlight.setPointerMode(false);

		// Disable spotlight on scroller
		if (scrollerRef.current) {
			scrollerRef.current.setAttribute('data-spotlight-container-disabled', 'true');
		}

		// Focus banner with multiple attempts
		const focusBanner = () => {
			if (bannerRef.current) {
				const focused = bannerRef.current.focus();
				if (!focused) {
					// If focus fails, try again after a short delay
					setTimeout(() => bannerRef.current?.focus(), 50);
				}
			}
		};

		// Initial focus sequence
		if (isInitialMount.current) {
			isInitialMount.current = false;

			// First try immediately
			focusBanner();

			// Then after a short delay
			const timer1 = setTimeout(focusBanner, 100);

			// One more after components are settled
			const timer2 = setTimeout(focusBanner, 300);

			// Final attempt after a longer delay
			const timer3 = setTimeout(focusBanner, 1000);

			return () => {
				clearTimeout(timer1);
				clearTimeout(timer2);
				clearTimeout(timer3);
			};
		} else {
			// On subsequent renders, just focus once
			focusBanner();
		}
	}, [panelIndex]);

	// Handle content height separately
	useEffect(() => {
		if (contentRef.current) {
			const height = contentRef.current.scrollHeight;
			setContentHeight(height);
		}
	}, [hasMovies, hasTvShows]);

	const handleKeyDown = useCallback((e) => {
		if (e.keyCode === 40) {
			// Down arrow
			e.preventDefault();
			const scroller = contentRef.current;
			if (scroller) {
				const currentScrollTop = scroller.scrollTop;
				scroller.scrollTo({
					top: currentScrollTop + 400,
					behavior: "smooth",
				});
			}
		} else if (e.keyCode === 38) {
			// Up arrow
			e.preventDefault();
			const scroller = contentRef.current;
			if (scroller) {
				const currentScrollTop = scroller.scrollTop;
				scroller.scrollTo({
					top: currentScrollTop - 400,
					behavior: "smooth",
				});
			}
		}
	}, []);

	useEffect(() => {
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [handleKeyDown]);

	return (
		<div data-component-id="home" data-spotlight-id="home-main" className={css.homeWrapper}>
			<Scroller
				ref={scrollerRef}
				className={css.homeScroller}
				direction="vertical"
				focusableScrollbar={false}
				horizontalScrollThumbAriaLabel="scroll thumb"
				verticalScrollThumbAriaLabel="scroll thumb"
				scrollMode="native"
				verticalScrollbar="hidden"
				fadeOut
				noScrollByWheel
				noScrollByDrag
				data-spotlight-container-disabled="true"
				style={{
					"--scroll-content-height": `${contentHeight}px`,
				}}
			>
				<div
					ref={contentRef}
					className={css.homeContent}
					onKeyDown={handleKeyDown}
				>
					<HomeBanner
						ref={bannerRef}
						setPanelIndex={setPanelIndex}
						setSelectedMovieId={setSelectedMovieId}
					/>
					{hasMovies && (
						<div className={css.section}>
							<SectionHeader title="Featured Movies" />
							<MoviesCarousel
								setPanelIndex={setPanelIndex}
								setSelectedMovieId={setSelectedMovieId}
							/>
						</div>
					)}
					{hasTvShows && (
						<div className={css.section}>
							<SectionHeader title="Popular TV Shows" />
							<TvShowsCarousel
								setPanelIndex={setPanelIndex}
								setSelectedMovieId={setSelectedMovieId}
							/>
						</div>
					)}
				</div>
			</Scroller>
		</div>
	);
};

// Configure SpotlightContainerDecorator
const HomeDecorator = SpotlightContainerDecorator({
	enterTo: "default-element",
	defaultElement: '[spotlightId="banner-container"]',
	preserveId: true,
});

export default HomeDecorator(Home);
