import kind from "@enact/core/kind";
import css from "./Header.module.less";

const AppHeader = kind({
  name: "Header",

  styles: {
    css,
    className: "header",
  },

  render: (props) => <div {...props} title="My OTT App" />,
});

export default AppHeader;
