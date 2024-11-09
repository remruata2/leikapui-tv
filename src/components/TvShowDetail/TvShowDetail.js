// src/views/TvShowsDetail/MoviesDetail.js
import { useEffect, useState } from "react";
import { Image } from "@enact/sandstone/Image";
import { BodyText } from "@enact/sandstone/BodyText";
import css from "./TvShowDetail.module.less";

const TvShowDetail = ({ selectedMovieId }) => {
  const [tvShow, setTvShow] = useState(null);
  console.log("test");

  useEffect(() => {
    fetch(
      `https://quiet-coast-60557-5151c2363932.herokuapp.com/api/tvShows/${selectedMovieId}`
    )
      .then((response) => response.json())
      .then((data) => setTvShow(data))
      .catch((error) => console.error("Error:", error));
  }, [selectedMovieId]);

  if (!tvShow) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className={css.content}>
        <Image
          className={css.horizontal_poster}
          src={tvShow.horizontal_poster}
        />
        <div className={css.details}>
          <BodyText>{tvShow.description}</BodyText>
        </div>
      </div>
    </div>
  );
};

export default TvShowDetail;
