import { useEffect, useState } from "react";
import { BodyText } from "@enact/sandstone/BodyText";
import Scroller from "@enact/ui/Scroller";
import Spottable from "@enact/spotlight/Spottable";
import ThemeDecorator from "@enact/sandstone/ThemeDecorator";
import { Panels, Panel } from "@enact/sandstone/Panels";
import Button from "@enact/sandstone/Button";
import {
  FaUserCircle,
  FaShoppingCart,
  FaClock,
  FaExclamationCircle,
} from "react-icons/fa";
import { MdPlayCircleFilled, MdLocalMovies } from "react-icons/md";
import VideoPlayerComponent from "../../components/VideoPlayer/VideoPlayer";
import YouTubePlayer from "../../components/YouTubePlayer/YouTubePlayer";
import { StorageService } from "../../utils/storage";
import css from "./MovieDetail.module.less";

const MovieDetailBase = ({
  selectedMovieId,
  setSidebarDisplay,
  setPanelIndex,
}) => {
  const [movie, setMovie] = useState(null);
  const [index, setIndex] = useState(0);
  const [user, setUser] = useState(null);
  const [purchaseStatus, setPurchaseStatus] = useState(null);

  const SpottableButton = Spottable(Button);

  useEffect(() => {
    // Check if user is logged in using StorageService
    const authData = StorageService.getItem("authData");
    if (authData?.user) {
      setUser(authData);
    }
  }, []);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/movies/${selectedMovieId}`)
      .then((response) => response.json())
      .then((data) => setMovie(data.data))
      .catch((error) => console.error("Error:", error));
  }, [selectedMovieId]);

  useEffect(() => {
    // Check purchase status if user is logged in
    if (user?.user && movie) {
      fetch(
        `${process.env.REACT_APP_API_URL}/api/transactions/check-payment/${movie._id}?userId=${user.user.id}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            setPurchaseStatus(data);
          }
        })
        .catch((error) => console.error("Error:", error));
    }
  }, [user, movie]);

  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handlePlayButtonClick = () => {
    setIndex(1);
    setSidebarDisplay(false);
  };

  const handleLoginClick = () => {
    setPanelIndex(6);
  };

  const handleRentClick = () => {
    console.log("Rent functionality to be implemented");
  };

  const renderActionButton = () => {
    if (!user) {
      return (
        <SpottableButton className={css.loginButton} onClick={handleLoginClick}>
          <FaUserCircle className={css.buttonIcon} />
          Login to Watch
        </SpottableButton>
      );
    }

    if (purchaseStatus?.hasPaid) {
      return (
        <SpottableButton
          className={css.playButton}
          onClick={handlePlayButtonClick}
        >
          <MdPlayCircleFilled className={css.buttonIcon} />
          Watch Now
          {purchaseStatus.remainingTime && (
            <span className={css.remainingTime}>
              ({purchaseStatus.remainingTime} left)
            </span>
          )}
        </SpottableButton>
      );
    }

    return (
      <SpottableButton className={css.rentButton} onClick={handleRentClick}>
        <FaShoppingCart className={css.buttonIcon} />
        Rent Now
      </SpottableButton>
    );
  };

  if (!movie) {
    return (
      <div className={css.loading}>
        <div className={css.spinner} />
        <BodyText>Loading movie details...</BodyText>
      </div>
    );
  }

  const youtubeId = getYouTubeId(movie.trailer_url);

  return (
    <Panels
      index={index}
      onSelectBreadcrumb={(e) => setIndex(e.index)}
      onBack={() => setIndex(0)}
      style={{ height: "100vh" }}
    >
      <Panel style={{ height: "100%" }}>
        <Scroller style={{ height: "100%" }}>
          <div
            className={css.movieDetail}
            style={{
              backgroundImage: `url(${movie.horizontal_poster})`,
            }}
          >
            <div className={css.trailerSection}>
              {youtubeId ? (
                <YouTubePlayer videoId={youtubeId} />
              ) : (
                <div className={css.noTrailer}>
                  <FaExclamationCircle className={css.warningIcon} />
                  <span>No trailer available</span>
                </div>
              )}
            </div>

            <div className={css.content}>
              <span className={css.movieTitle}>{movie.title}</span>

              <div className={css.badgeSection}>
                <div className={css.badge}>
                  <FaClock className={css.icon} />
                  <span className={css.tagText}>{movie.duration}</span>
                </div>
                <div className={css.badge}>
                  <MdLocalMovies className={css.icon} />
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

              <div className={css.actionSection}>{renderActionButton()}</div>
            </div>
          </div>
        </Scroller>
      </Panel>
      <Panel>
        <VideoPlayerComponent
          source={movie.video_url || process.env.REACT_APP_SAMPLE_VIDEO_URL}
        />
      </Panel>
    </Panels>
  );
};

const MovieDetail = ThemeDecorator(Spottable(MovieDetailBase));

export default MovieDetail;
