import css from "./Home.module.less";
import SpotlightContainerDecorator from "@enact/spotlight/SpotlightContainerDecorator";
import MoviesCarousel from "../MoviesCarousel/MoviesCarousel";
import TvShowsCarousel from "../TvShowsCarousel/TvShowsCarousel";
import Heading from "@enact/sandstone/Heading";
import Scroller from "@enact/ui/Scroller";

const Home = ({ setPanelIndex, setSelectedMovieId }) => {
  return (
    <Scroller>
      <div>
        <Heading size="large">Movies</Heading>
        <MoviesCarousel
          className={css.carousel}
          setPanelIndex={setPanelIndex}
          setSelectedMovieId={setSelectedMovieId}
        />
      </div>
      <div style={{ marginTop: "50px" }}>
        <Heading>Tv Shows</Heading>
        <TvShowsCarousel
          className={css.carousel}
          setPanelIndex={setPanelIndex}
          setSelectedMovieId={setSelectedMovieId}
        />
      </div>
    </Scroller>
  );
};

export default SpotlightContainerDecorator(Home);
