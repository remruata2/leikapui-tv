import css from "./Home.module.less";
import SpotlightContainerDecorator from "@enact/spotlight/SpotlightContainerDecorator";
import MoviesCarousel from "../../components/MoviesCarousel/MoviesCarousel";
import TvShowsCarousel from "../../components/TvShowsCarousel/TvShowsCarousel";
import Heading from "@enact/sandstone/Heading";
import Scroller from "@enact/sandstone/Scroller";
import HomeBanner from "../../components/HomeBanner/HomeBanner";
import { useEffect } from "react";
import Spotlight from "@enact/spotlight";

const Home = ({ setPanelIndex, setSelectedMovieId }) => {
  useEffect(() => {
    // Set 5-way mode and initialize spotlight
    Spotlight.setPointerMode(false);
    
    // Wait for next render cycle to ensure components are mounted
    const timer = setTimeout(() => {
      const bannerElement = document.querySelector('[spotlightId="banner-container"]');
      if (bannerElement) {
        Spotlight.focus(bannerElement);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={css.homeWrapper}>
      <Scroller
        className={css.homeScroller}
        direction="vertical"
        focusableScrollbar
        horizontalScrollThumbAriaLabel="scroll thumb"
        spotlightDisabled={false}
        verticalScrollThumbAriaLabel="scroll thumb"
        scrollMode="translate"
      >
        <div className={css.homeContent}>
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
  enterTo: 'default-element',
  defaultElement: '[spotlightId="banner-container"]',
  preserveId: true
});

export default HomeDecorator(Home);
