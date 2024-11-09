import kind from "@enact/core/kind";
import css from "./TvShows.module.less";

const TvShows = kind({
  name: "TvShows",

  styles: {
    css,
    className: "tvShows",
  },

  render: (props) => (
    <div {...props}>
      <h1>Welcome to the TvShows Page</h1>
    </div>
  ),
});

export default TvShows;
