import { useEffect, useState, useCallback, useRef, forwardRef, useImperativeHandle } from "react";
import Panels, { Panel } from "@enact/sandstone/Panels";
import Spottable from "@enact/spotlight/Spottable";
import Spotlight from "@enact/spotlight";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import HeroMetadata from "./HeroMetadata";
import css from "./HomeBanner.module.less";

const AUTO_SLIDE_INTERVAL = 7000;

const SpottableDiv = Spottable("div");

const HomeBanner = forwardRef(({ setPanelIndex, setSelectedMovieId }, ref) => {
	const containerRef = useRef(null);
	const [bannerData, setBannerData] = useState([]);
	const [error, setError] = useState(null);
	const [currentIndex, setCurrentIndex] = useState(0);
	const isFocusedRef = useRef(false);
	const autoSlideRef = useRef(null);

	// Forward the ref to the container
	useImperativeHandle(ref, () => ({
		focus: () => {
			const playBtn = document.querySelector(`[data-spotlight-id="banner-play-btn-${currentIndex}"]`);
			if (playBtn) {
				return Spotlight.focus(playBtn);
			}
			if (containerRef.current) {
				containerRef.current.focus();
				return true;
			}
			return false;
		}
	}));

	useEffect(() => {
		let isMounted = true;
		const fetchBannerData = async () => {
			try {
				const response = await fetch(
					`${process.env.REACT_APP_API_URL}/api/sliders`
				);
				if (!response.ok) {
					throw new Error("Failed to fetch banner data");
				}
				const data = await response.json();
				if (isMounted && Array.isArray(data) && data.length > 0) {
					setBannerData(data);
				}
			} catch (err) {
				if (isMounted) setError(err.message);
				console.error("Error fetching banner data:", err);
			}
		};

		fetchBannerData();
		return () => {
			isMounted = false;
		};
	}, []);

	// Helper to go to prev/next slide and reset auto-slide timer
	const goToSlide = useCallback((targetIdx, total) => {
		setCurrentIndex(targetIdx);
		// Reset auto-slide timer on manual navigation
		if (autoSlideRef.current) {
			clearInterval(autoSlideRef.current);
		}
		if (total > 1) {
			autoSlideRef.current = setInterval(() => {
				if (!isFocusedRef.current) {
					setCurrentIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
				}
			}, AUTO_SLIDE_INTERVAL);
		}
	}, []);

	// Auto-slide effect
	useEffect(() => {
		if (bannerData.length <= 1) return;

		autoSlideRef.current = setInterval(() => {
			if (!isFocusedRef.current) {
				setCurrentIndex((prev) => (prev === bannerData.length - 1 ? 0 : prev + 1));
			}
		}, AUTO_SLIDE_INTERVAL);

		return () => {
			if (autoSlideRef.current) clearInterval(autoSlideRef.current);
		};
	}, [bannerData.length]);

	const handleNavigate = useCallback(
		(banner, defaultPanel = 1) => {
			if (!banner) return;
			const targetId = banner.id || banner.movie_id || banner._id;
			if (!targetId) return;

			setSelectedMovieId(targetId);
			const targetPanel = banner.type === "tv-show" ? 2 : defaultPanel;
			setPanelIndex(targetPanel);
		},
		[setPanelIndex, setSelectedMovieId]
	);

	const handleFocusIn = () => {
		isFocusedRef.current = true;
	};

	const handleFocusOut = () => {
		isFocusedRef.current = false;
	};

	// D-pad left/right on the banner container navigates slides
	const handleSpotlightLeft = useCallback(
		(ev) => {
			if (bannerData.length <= 1) return;
			ev.preventDefault();
			ev.stopPropagation();
			const prevIdx = currentIndex === 0 ? bannerData.length - 1 : currentIndex - 1;
			goToSlide(prevIdx, bannerData.length);
		},
		[currentIndex, bannerData.length, goToSlide]
	);

	const handleSpotlightRight = useCallback(
		(ev) => {
			if (bannerData.length <= 1) return;
			ev.preventDefault();
			ev.stopPropagation();
			const nextIdx = currentIndex === bannerData.length - 1 ? 0 : currentIndex + 1;
			goToSlide(nextIdx, bannerData.length);
		},
		[currentIndex, bannerData.length, goToSlide]
	);

	if (error || !bannerData.length) {
		return null;
	}

	const total = bannerData.length;

	return (
		<div
			ref={containerRef}
			className={css.bannerContainer}
			tabIndex="-1"
			onFocus={handleFocusIn}
			onBlur={handleFocusOut}
		>
			<SpottableDiv
				className={css.bannerSpottable}
				spotlightId="banner-container"
				tabIndex="0"
				onSpotlightLeft={handleSpotlightLeft}
				onSpotlightRight={handleSpotlightRight}
			>
				<Panels
					index={currentIndex}
					onChange={({ index }) => setCurrentIndex(index)}
					className={css.bannerPanels}
				>
					{bannerData.map((banner, index) => (
						<Panel key={banner.id || banner._id || index} className={css.bannerPanel}>
							<div
								className={`${css.bannerBackdrop} ${index === currentIndex ? css.activeBackdrop : ""}`}
								style={{
									backgroundImage: `url(${banner.horizontal_poster || banner.vertical_poster})`,
								}}
							/>
							<div className={css.gradientVignette} />

							<HeroMetadata
								item={banner}
								index={index}
								onPlay={() => handleNavigate(banner, 1)}
							/>
						</Panel>
					))}
				</Panels>

				{/* Left arrow nav */}
				{total > 1 && (
					<SpottableDiv
						className={css.slideNavLeft}
						spotlightId="banner-nav-left"
						tabIndex="0"
						onClick={() => {
							const prevIdx = currentIndex === 0 ? total - 1 : currentIndex - 1;
							goToSlide(prevIdx, total);
						}}
					>
						<MdChevronLeft />
					</SpottableDiv>
				)}

				{/* Right arrow nav */}
				{total > 1 && (
					<SpottableDiv
						className={css.slideNavRight}
						spotlightId="banner-nav-right"
						tabIndex="0"
						onClick={() => {
							const nextIdx = currentIndex === total - 1 ? 0 : currentIndex + 1;
							goToSlide(nextIdx, total);
						}}
					>
						<MdChevronRight />
					</SpottableDiv>
				)}

				{/* Slide indicators */}
				{total > 1 && (
					<div className={css.indicatorsContainer}>
						{bannerData.map((_, dotIdx) => (
							<span
								key={dotIdx}
								className={`${css.indicatorDot} ${dotIdx === currentIndex ? css.activeDot : ""}`}
							/>
						))}
					</div>
				)}
			</SpottableDiv>
		</div>
	);
});

HomeBanner.displayName = "HomeBanner";

export default HomeBanner;
