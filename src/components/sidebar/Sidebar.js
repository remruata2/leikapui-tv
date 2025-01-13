import { useState, useCallback } from "react";
import css from "./Sidebar.module.less";
import { RiHome5Fill, RiMovie2Fill, RiTvFill } from "react-icons/ri";
import { BiLogOut, BiLogIn } from "react-icons/bi";
import Item from "@enact/sandstone/Item";
import { Cell } from "@enact/ui/Layout";
import SpotlightContainerDecorator from "@enact/spotlight/SpotlightContainerDecorator";

const Sidebar = ({
  open,
  onToggleSidebar,
  setPanelIndex,
  panelIndex,
  isLoggedIn,
  onLogout,
  sideBarDisplay,
  className,
}) => {
  const [focusedIndex, setFocusedIndex] = useState(0);

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

  // Add login/logout to total menu items for navigation
  const totalMenuItems = isLoggedIn ? menuItems.length + 1 : menuItems.length + 1;

  const handleItemClick = (index, panelIdx) => {
    console.log("Item clicked:", index, panelIdx);
    setPanelIndex(panelIdx);
    onToggleSidebar({ open: false });
  };

  const handleSidebarFocus = (e) => {
    console.log("Sidebar focused", e.target);
    // Focus the first menu item when sidebar opens
    const firstMenuItem = document.querySelector(
      '[data-spotlight-id="menu-item-0"]'
    );
    if (firstMenuItem) {
      firstMenuItem.focus();
      setFocusedIndex(0);
    }
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

        // Calculate next index, including login/logout item
        const nextIndex = focusedIndex < totalMenuItems - 1 ? focusedIndex + 1 : focusedIndex;

        // Focus the next item
        let nextElement;
        if (nextIndex === menuItems.length) {
          // If next item is login/logout
          nextElement = document.querySelector(
            `[data-spotlight-id="${isLoggedIn ? 'logout-item' : 'login-item'}"]`
          );
        } else {
          nextElement = document.querySelector(
            `[data-spotlight-id="menu-item-${nextIndex}"]`
          );
        }

        if (nextElement) {
          nextElement.focus();
          setFocusedIndex(nextIndex);
        }
      } else if (e.keyCode === 38) {
        // Up arrow
        e.preventDefault();
        e.stopPropagation();

        // Calculate previous index
        const prevIndex = focusedIndex > 0 ? focusedIndex - 1 : focusedIndex;

        // Focus the previous item
        let prevElement;
        if (prevIndex === menuItems.length) {
          // If prev item is login/logout
          prevElement = document.querySelector(
            `[data-spotlight-id="${isLoggedIn ? 'logout-item' : 'login-item'}"]`
          );
        } else {
          prevElement = document.querySelector(
            `[data-spotlight-id="menu-item-${prevIndex}"]`
          );
        }

        if (prevElement) {
          prevElement.focus();
          setFocusedIndex(prevIndex);
        }
      } else if (e.keyCode === 13) {
        // Enter key
        e.preventDefault();
        e.stopPropagation();
        if (focusedIndex === menuItems.length) {
          // If login/logout item is focused
          if (isLoggedIn) {
            onLogout();
          } else {
            handleItemClick(focusedIndex, 5); // Login panel
          }
        } else {
          const currentItem = menuItems[focusedIndex];
          handleItemClick(focusedIndex, currentItem.index);
        }
      }
    },
    [focusedIndex, menuItems, isLoggedIn, onLogout]
  );

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
            onClick={() => handleItemClick(index, item.index)}
            className={`${css.menuItem} ${
              item.index === panelIndex ? css.active : ""
            } ${focusedIndex === index ? css.focused : ""}`}
            spotlightId={`menu-item-${index}`}
            onFocus={() => setFocusedIndex(index)}
            tabIndex={0}
          >
            <div className={css.itemContent}>
              {item.icon}
              <span className={css.label}>{item.label}</span>
            </div>
          </Item>
        ))}
        {isLoggedIn ? (
          <Item
            onClick={onLogout}
            className={`${css.menuItem} ${
              focusedIndex === menuItems.length ? css.focused : ""
            }`}
            spotlightId="logout-item"
            onFocus={() => setFocusedIndex(menuItems.length)}
            tabIndex={0}
          >
            <div className={css.itemContent}>
              <BiLogOut className={css.icon} />
              <span className={css.label}>Logout</span>
            </div>
          </Item>
        ) : (
          <Item
            onClick={() => handleItemClick(menuItems.length, 5)}
            className={`${css.menuItem} ${
              focusedIndex === menuItems.length ? css.focused : ""
            }`}
            spotlightId="login-item"
            onFocus={() => setFocusedIndex(menuItems.length)}
            tabIndex={0}
          >
            <div className={css.itemContent}>
              <BiLogIn className={css.icon} />
              <span className={css.label}>Login</span>
            </div>
          </Item>
        )}
      </div>
    </Cell>
  );
};

// Configure SpotlightContainerDecorator
const SidebarDecorator = SpotlightContainerDecorator({
  enterTo: "default-element",
  defaultElement: '[data-spotlight-id="menu-item-0"]',
  preserveId: true,
});

export default SidebarDecorator(Sidebar);
