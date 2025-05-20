import { useEffect, useState, useCallback, useRef, forwardRef, useImperativeHandle } from "react";
import Heading from "@enact/sandstone/Heading";
import Image from "@enact/sandstone/Image";
import Button from "@enact/sandstone/Button";
import Panels from "@enact/sandstone/Panels";
import Panel from "@enact/sandstone/Panels/Panel";
import Spottable from "@enact/spotlight/Spottable";
import css from "./HomeBanner.module.less";

const AUTO_SLIDE_INTERVAL = 5000; // 5 seconds per slide

const SpottableDiv = Spottable("div");

const HomeBanner = forwardRef(({ setPanelIndex, setSelectedMovieId }, ref) => {
  const containerRef = useRef(null);
  
  // Forward the ref to the container
  useImperativeHandle(ref, () => ({
    focus: () => {
      if (containerRef.current) {
        containerRef.current.focus();
        return true;
      }
      return false;
    }
  }));
  const [bannerData, setBannerData] = useState([]);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchBannerData = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/sliders`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch banner data");
        }
        const data = await response.json();
        console.log("Banner API Response:", data);
        setBannerData(data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching banner data:", err);
      }
    };

    fetchBannerData();
  }, []);

  useEffect(() => {
    if (bannerData.length > 1) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex === bannerData.length - 1 ? 0 : prevIndex + 1
        );
      }, AUTO_SLIDE_INTERVAL);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [bannerData.length]);

  const handlePlayClick = useCallback(
    (banner) => {
      console.log("Play button clicked");

      if (banner) {
        const movieId = banner.id || banner.movie_id || banner._id;
        console.log("Movie ID:", movieId);

        if (movieId) {
          setSelectedMovieId(movieId);
          setPanelIndex(1); // Navigate to movie details panel
        } else {
          console.error("No valid movie ID found in banner data");
        }
      }
    },
    [setPanelIndex, setSelectedMovieId]
  );

  const handleButtonClick = (banner) => {
    handlePlayClick(banner);
  };

  if (error || !bannerData.length) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className={css.bannerContainer}
      tabIndex="-1"
      data-spotlight-container-disabled="false"
    >
      <SpottableDiv
        className={css.bannerSpottable}
        spotlightId="banner-container"
        tabIndex="0"
        data-spotlight-default="container"
      >
      <Panels
        index={currentIndex}
        onChange={({ index }) => setCurrentIndex(index)}
        className={css.bannerPanels}
      >
        {bannerData.map((banner, index) => (
          <Panel key={banner.id || index} className={css.bannerPanel}>
            <Image
              className={css.bannerImage}
              src={banner.horizontal_poster}
              sizing="fill"
            >
              <div className={css.bannerContent}>
                <Heading className={css.bannerTitle} size="large">
                  {banner.title}
                </Heading>
                {banner.description && (
                  <Heading className={css.bannerDescription} size="small">
                    {banner.description}
                  </Heading>
                )}
                <Button
                  className={css.playButton}
                  icon="playcircle"
                  size="large"
                  onClick={() => handleButtonClick(banner)}
                  backgroundOpacity="transparent"
                  spotlightId={`play-button-${index}`}
                  css={{
                    button: css.buttonRoot,
                    icon: css.buttonIcon,
                  }}
                >
                  <div className={css.playButtonContent}>Play</div>
                </Button>
              </div>
            </Image>
          </Panel>
        ))}
      </Panels>
      </SpottableDiv>
    </div>
  );
});

HomeBanner.displayName = 'HomeBanner';

export default HomeBanner;
