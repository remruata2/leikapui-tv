import { useState } from "react";
import css from "./Sidebar.module.less";
import { RiHome5Fill, RiMovie2Fill, RiTvFill } from "react-icons/ri";
import { BiLogOut } from "react-icons/bi";
import Item from "@enact/sandstone/Item";
import { Cell } from "@enact/ui/Layout";
import SpotlightContainerDecorator from "@enact/spotlight/SpotlightContainerDecorator";

const Sidebar = ({
  open,
  setPanelIndex,
  onToggleSidebar,
  className,
  isLoggedIn,
  onLogout,
  sideBarDisplay,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const menuItems = [
    {
      icon: <RiHome5Fill className={css.icon} />,
      label: "Home",
      index: 0,
    },
    {
      icon: <RiMovie2Fill className={css.icon} />,
      label: "Movies",
      index: 3,
    },
    {
      icon: <RiTvFill className={css.icon} />,
      label: "TV Shows",
      index: 4,
    },
  ];

  const handleItemClick = (index, panelIdx) => {
    setCurrentIndex(index);
    setPanelIndex(panelIdx);
  };

  const handleSidebarFocus = () => {
    onToggleSidebar({ open: true });
  };

  const handleSidebarBlur = () => {
    onToggleSidebar({ open: false });
  };

  const handleMenuItemClick = (index, panelIdx) => {
    handleItemClick(index, panelIdx);
  };

  if (!sideBarDisplay) {
    return null;
  }

  return (
    <Cell
      className={`${css.sidebar} ${!open ? css.closed : ''} ${className || ''}`}
      onFocus={handleSidebarFocus}
      onBlur={handleSidebarBlur}
      shrink
    >
      <div className={css.menuContainer}>
        {menuItems.map((item, index) => (
          <Item
            key={index}
            onClick={() => handleMenuItemClick(index, item.index)}
            className={`${css.menuItem} ${
              currentIndex === index ? css.active : ""
            }`}
            spotlightId={`menu-item-${index}`}
          >
            <div className={css.itemContent}>
              {item.icon}
              <span className={css.label}>{item.label}</span>
            </div>
          </Item>
        ))}
        {isLoggedIn && (
          <Item
            onClick={onLogout}
            className={css.menuItem}
            spotlightId="logout-item"
          >
            <div className={css.itemContent}>
              <BiLogOut className={css.icon} />
              <span className={css.label}>Logout</span>
            </div>
          </Item>
        )}
      </div>
    </Cell>
  );
};

// Configure SpotlightContainerDecorator with specific settings for sidebar
const SidebarDecorator = SpotlightContainerDecorator({
  enterTo: "last-focused",
  defaultElement: '[spotlightId="menu-item-0"]',
  preserveId: true,
});

export default SidebarDecorator(Sidebar);
