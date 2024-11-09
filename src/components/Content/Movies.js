import kind from "@enact/core/kind";
import css from "./Movies.module.less";

const Movies = kind({
  name: "Movies",

  styles: {
    css,
    className: "movies",
  },

  render: (props) => (
    <div {...props}>
      <h1>Welcome to the Movies Page</h1>
    </div>
  ),
});

export default Movies;
