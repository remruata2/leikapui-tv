import { useEffect, useState } from "react";
import { BodyText } from "@enact/sandstone/BodyText";
import Scroller from "@enact/ui/Scroller";
import Spottable from "@enact/spotlight/Spottable";
import ThemeDecorator from "@enact/sandstone/ThemeDecorator";
import Icon from "@enact/sandstone/Icon";
import { Panels, Panel } from "@enact/sandstone/Panels";
import VideoPlayerComponent from "../../components/VideoPlayer/VideoPlayer";
import css from "./MovieDetail.module.less";

const MovieDetailBase = ({ selectedMovieId, setSidebarDisplay }) => {
  const [movie, setMovie] = useState(null);
  const [index, setIndex] = useState(0);

  const SpottableButton = Spottable("button");
  const SpottableDiv = Spottable("div");

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/movies/${selectedMovieId}`)
      .then((response) => response.json())
      .then((data) => setMovie(data.data))
      .catch((error) => console.error("Error:", error));
  }, [selectedMovieId]);

  const handlePlayButtonClick = () => {
    setIndex(1);
    setSidebarDisplay(false);
  };

  if (!movie) {
    return (
      <div className={css.loading}>
        <Icon>loading</Icon>
        <BodyText>Loading movie details...</BodyText>
      </div>
    );
  }

  return (
    <Panels
      index={index}
      onSelectBreadcrumb={(e) => setIndex(e.index)}
      onBack={() => setIndex(0)}
    >
      <Panel>
        <Scroller>
          <div
            className={css.movieDetail}
            style={{
              backgroundImage: `url(${movie.horizontal_poster})`,
            }}
          >
            <div className={css.content}>
              <span className={css.movieTitle}>{movie.title}</span>

              <div className={css.badgeSection}>
                <div className={css.badge}>
                  <Icon className={css.icon}>timer</Icon>
                  <span className={css.tagText}>{movie.duration}</span>
                </div>
                <div className={css.badge}>
                  <Icon className={css.icon}>guide</Icon>
                  <span className={css.tagText}>
                    {new Date(movie.release_date).getFullYear()}
                  </span>
                </div>
              </div>

              <div className={css.genresSection}>
                {movie.genres.split(",").map((genre, index) => (
                  <div key={index} className={css.genreTag}>
                    {genre.trim()}
                  </div>
                ))}
              </div>

              <div className={css.descriptionSection}>
                <div className={css.summaryHeading}>
                  <span>Summary</span>
                </div>
                <span className={css.summaryText}>{movie.description}</span>
              </div>

              <div className={css.metadataSection}>
                <div className={css.metadataItem}>
                  <div>
                    <span className={css.label}>Director</span>
                    <div className={css.value}>{movie.director}</div>
                  </div>
                </div>
                <div className={css.metadataItem}>
                  <div>
                    <div className={css.label}>Producer</div>
                    <div className={css.value}>{movie.producer}</div>
                  </div>
                </div>
              </div>

              <div className={css.actionSection}>
                <SpottableButton
                  className={css.playButton}
                  onClick={handlePlayButtonClick}
                >
                  <Icon className={css.playIcon}>playcircle</Icon>
                  <div>Watch Now</div>
                </SpottableButton>
              </div>
            </div>
          </div>
        </Scroller>
      </Panel>
      <Panel>
        <VideoPlayerComponent
          source={
            process.env.REACT_APP_SAMPLE_VIDEO_URL ||
            "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
          }
        />
      </Panel>
    </Panels>
  );
};

const MovieDetail = ThemeDecorator(Spottable(MovieDetailBase));

export default MovieDetail;
