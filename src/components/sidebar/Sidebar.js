import { useState, useCallback } from "react";
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
    console.log("Item clicked:", index, panelIdx);
    setCurrentIndex(index);
    setPanelIndex(panelIdx);
  };

  const handleSidebarFocus = (e) => {
    console.log("Sidebar focused", e.target);
    onToggleSidebar({ open: true });
  };

  const handleSidebarBlur = (e) => {
    // Check if the new focus target is still within the sidebar
    const isStillInSidebar = e.currentTarget.contains(e.relatedTarget);
    console.log("Sidebar blurred", {
      isStillInSidebar,
      currentTarget: e.currentTarget,
      relatedTarget: e.relatedTarget,
    });

    // Only close sidebar if focus is actually leaving the sidebar
    if (!isStillInSidebar) {
      onToggleSidebar({ open: false });
    }
  };

  const handleKeyDown = useCallback(
    (e) => {
      console.log("Key pressed in sidebar:", e.keyCode);
      if (e.keyCode === 40) {
        // Down arrow
        e.preventDefault();
        e.stopPropagation();
        console.log("Current index:", currentIndex);

        // Calculate next index
        const nextIndex =
          currentIndex < menuItems.length - 1 ? currentIndex + 1 : currentIndex;

        // Focus the next item
        const nextElement = document.querySelector(
          `[data-spotlight-id="menu-item-${nextIndex}"]`
        );
        if (nextElement) {
          nextElement.focus();
          setCurrentIndex(nextIndex);
        }
      } else if (e.keyCode === 38) {
        // Up arrow
        e.preventDefault();
        e.stopPropagation();

        // Calculate previous index
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : currentIndex;

        // Focus the previous item
        const prevElement = document.querySelector(
          `[data-spotlight-id="menu-item-${prevIndex}"]`
        );
        if (prevElement) {
          prevElement.focus();
          setCurrentIndex(prevIndex);
        }
      }
    },
    [currentIndex, menuItems.length]
  );

  const handleMenuItemClick = (index, panelIdx) => {
    handleItemClick(index, panelIdx);
  };

  if (!sideBarDisplay) {
    return null;
  }

  return (
    <Cell
      className={`${css.sidebar} ${!open ? css.closed : ""} ${className || ""}`}
      onFocus={handleSidebarFocus}
      onBlur={handleSidebarBlur}
      onKeyDown={handleKeyDown}
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
            onFocus={() => console.log("Item focused:", index)}
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
            onFocus={() => console.log("Logout item focused")}
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
  restrict: "self-only",
});

export default SidebarDecorator(Sidebar);
