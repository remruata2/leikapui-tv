import kind from "@enact/core/kind";
import css from "./Footer.module.less";
import Item from "@enact/sandstone/Item";

const AppFooter = kind({
  name: "Footer",

  styles: {
    css,
    className: "footer",
  },

  render: (props) => (
    <div {...props}>
      <Item>About</Item>
      <Item>Contact</Item>
    </div>
  ),
});

export default AppFooter;
