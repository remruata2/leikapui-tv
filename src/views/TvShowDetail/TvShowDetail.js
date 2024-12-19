import { useEffect, useState } from "react";
import { BodyText } from "@enact/sandstone/BodyText";
import Scroller from "@enact/ui/Scroller";
import ImageItem from "@enact/ui/ImageItem";
import Heading from "@enact/sandstone/Heading";
import Spottable from "@enact/spotlight/Spottable";
import ThemeDecorator from "@enact/sandstone/ThemeDecorator";
import Icon from "@enact/sandstone/Icon";
import IconItem from "@enact/sandstone/IconItem";
import VideoPlayerComponent from "../../components/VideoPlayer/VideoPlayer"; // Adjust the import path as necessary
import css from "./TvShowDetail.module.less";
import { Panels, Panel } from "@enact/sandstone/Panels";
import { TabLayout, Tab } from "@enact/sandstone/TabLayout";

const TvShowBase = ({ selectedMovieId, setSidebarDisplay }) => {
  const [tvShow, setTvShow] = useState(null);
  const [index, setIndex] = useState(0);

  const SpottableButton = Spottable("button");
  const SpottableImageItem = Spottable(ImageItem);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/tvShows/${selectedMovieId}`)
      .then((response) => response.json())
      .then((data) => setTvShow(data))
      .catch((error) => console.error("Error:", error));
  }, [selectedMovieId]);

  const handlePlayButtonClick = () => {
    setIndex(1);
    setSidebarDisplay(false); // Assuming setSidebarDisplay is the function to hide the sidebar
  };

  const handleEpisodeClick = () => {
    setIndex(1);
  };

  const handleTabChange = (e) => {
    setIndex(e.index);
  };

  if (!tvShow) {
    return (
      <div style={{ margin: "100px" }}>
        <center>Loading...</center>
      </div>
    );
  }

  tvShow.seasons.forEach((season) => {
    season.episodes.forEach((episode) => {
      console.log(episode);
    });
  });

  return (
    <Panels
      index={index}
      onSelectBreadcrumb={handleTabChange}
      onBack={() => setIndex(0)}
    >
      <Panel>
        <Scroller>
          <div className={css.tvShowDetail}>
            <div className={css.horizontal_poster}>
              <IconItem
                background="#f5f5f58f"
                label="Play Trailer"
                labelColor="dark"
                bordered
                icon="playcircle"
                image={{
                  size: {
                    height: "4.125rem",
                    width: "4.125rem",
                  },
                  src: {
                    fhd: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300' width='300' height='300'%3E%3Crect width='300' height='300' fill='%237ed31d'%3E%3C/rect%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='36px' fill='%23ffffff'%3E300 X 300%3C/text%3E%3C/svg%3E",
                    hd: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' width='200' height='200'%3E%3Crect width='200' height='200' fill='%237ed31d'%3E%3C/rect%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='36px' fill='%23ffffff'%3E200 X 200%3C/text%3E%3C/svg%3E",
                    uhd: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600' width='600' height='600'%3E%3Crect width='600' height='600' fill='%237ed31d'%3E%3C/rect%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='36px' fill='%23ffffff'%3E600 X 600%3C/text%3E%3C/svg%3E",
                  },
                }}
                style={{
                  height: 100,
                  position: "absolute",
                  width: 150,
                  left: "23%",
                  top: "27%",
                }}
                labelOn="render"
                titleOn="render"
              />
              <ImageItem
                className={css.tvShowPoster}
                src={tvShow.horizontal_poster}
              />
            </div>
            <div className={css.content}>
              <h1>{tvShow.show_name}</h1>
              <div className={css.subContent}>
                <div className={css.dataTitle}>Release</div>
                <div className={css.dataValue}>
                  {new Date(tvShow.release_date).getFullYear()}
                </div>
              </div>
              <div className={css.subContent}>
                <div className={css.dataTitle}>Genres</div>
                <div className={css.dataValue}>{tvShow.genres}</div>
              </div>
              <div className={css.subContent}>
                <div className={css.dataTitle}>Director</div>
                <div className={css.dataValue}>{tvShow.director}</div>
              </div>
              <div className={css.subContent}>
                <div className={css.dataTitle}>Producer</div>
                <div className={css.dataValue}>{tvShow.producer}</div>
              </div>

              <SpottableButton
                className={css.playButton}
                onClick={handlePlayButtonClick}
              >
                <span style={{ fontSize: "2rem", color: "white" }}>
                  Play<Icon size="medium">triangleright</Icon>
                </span>
              </SpottableButton>
            </div>
          </div>
          <div className={css.description}>
            <hr />
            <Heading>
              <span style={{ color: "red" }}>Summary</span>
            </Heading>
            <BodyText>{tvShow.description}</BodyText>
          </div>

          <TabLayout orientation="horizontal">
            {tvShow.seasons.map((season, seasonIndex) => (
              <Tab title={`Season ${season.season_no}`} key={seasonIndex}>
                <div className={css.episodeItem}>
                  {season.episodes
                    .sort((a, b) => a.episode_no - b.episode_no)
                    .map((episode, episodeIndex) => (
                      <SpottableImageItem
                        inline
                        key={episodeIndex}
                        src={episode.horizontal_poster}
                        className={css.spottableImageItem}
                        style={{ width: 400, height: 300 }}
                        onClick={handleEpisodeClick}
                      >
                        <div className={css.episodeTitle}>
                          <span style={{ color: "red" }}>
                            {episode.duration}
                          </span>
                          <p>
                            Episode {episode.episode_no}:"{episode.title}"
                          </p>
                        </div>
                      </SpottableImageItem>
                    ))}
                </div>
              </Tab>
            ))}
          </TabLayout>
        </Scroller>
      </Panel>
      <Panel>
        <VideoPlayerComponent source="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" />
      </Panel>
    </Panels>
  );
};

const TvShow = ThemeDecorator(Spottable(TvShowBase));

export default TvShow;
