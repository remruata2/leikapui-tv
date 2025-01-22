import css from "./Home.module.less";
import SpotlightContainerDecorator from "@enact/spotlight/SpotlightContainerDecorator";
import MoviesCarousel from "../../components/MoviesCarousel/MoviesCarousel";
import TvShowsCarousel from "../../components/TvShowsCarousel/TvShowsCarousel";
import Heading from "@enact/sandstone/Heading";
import Scroller from "@enact/sandstone/Scroller";
import HomeBanner from "../../components/HomeBanner/HomeBanner";
import { useEffect, useRef, useCallback, useState } from "react";
import Spotlight from "@enact/spotlight";

const Home = ({ setPanelIndex, setSelectedMovieId, panelIndex }) => {
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef(null);

  useEffect(() => {
    // Set 5-way mode and initialize spotlight
    Spotlight.setPointerMode(false);

    // Wait for next render cycle to ensure components are mounted
    const timer = setTimeout(() => {
      // Try to focus the banner container first
      const bannerElement = document.querySelector('[spotlightId="banner-container"]');
      if (bannerElement) {
        Spotlight.focus(bannerElement);
      } else {
        // If banner container is not available, try to focus any spottable element in the home view
        const homeContainer = document.querySelector('[data-component-id="home"]');
        if (homeContainer) {
          Spotlight.focus(homeContainer);
        }
      }

      // Calculate and set content height
      if (contentRef.current) {
        const height = contentRef.current.scrollHeight;
        setContentHeight(height);
      }
    }, 100); // Increased timeout to ensure components are mounted

    return () => clearTimeout(timer);
  }, [panelIndex]); // Add panelIndex as dependency to re-run when returning to home

  const handleKeyDown = useCallback((e) => {
    if (e.keyCode === 40) { // Down arrow
      e.preventDefault();
      const scroller = contentRef.current;
      if (scroller) {
        const currentScrollTop = scroller.scrollTop;
        scroller.scrollTo({
          top: currentScrollTop + 400,
          behavior: 'smooth'
        });
      }
    } else if (e.keyCode === 38) { // Up arrow
      e.preventDefault();
      const scroller = contentRef.current;
      if (scroller) {
        const currentScrollTop = scroller.scrollTop;
        scroller.scrollTo({
          top: currentScrollTop - 400,
          behavior: 'smooth'
        });
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div data-component-id="home" className={css.homeWrapper}>
      <Scroller
        className={css.homeScroller}
        direction="vertical"
        focusableScrollbar
        horizontalScrollThumbAriaLabel="scroll thumb"
        verticalScrollThumbAriaLabel="scroll thumb"
        scrollMode="native"
        verticalScrollbar="visible"
        fadeOut={false}
        style={{
          '--scroll-content-height': `${contentHeight}px`,
        }}
      >
        <div ref={contentRef} className={css.homeContent} onKeyDown={handleKeyDown}>
          <HomeBanner
            setPanelIndex={setPanelIndex}
            setSelectedMovieId={setSelectedMovieId}
          />
          <div className={css.section}>
            <Heading size="large">Movies</Heading>
            <MoviesCarousel
              className={css.carousel}
              setPanelIndex={setPanelIndex}
              setSelectedMovieId={setSelectedMovieId}
            />
          </div>
          <div className={css.section}>
            <Heading>Tv Shows</Heading>
            <TvShowsCarousel
              className={css.carousel}
              setPanelIndex={setPanelIndex}
              setSelectedMovieId={setSelectedMovieId}
            />
          </div>
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
