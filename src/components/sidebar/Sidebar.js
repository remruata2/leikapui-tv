import { Cell } from "@enact/ui/Layout";
import Item from "@enact/sandstone/Item";
import Spotlight from "@enact/spotlight";
import css from "./Sidebar.module.less";
import {
  FaFilm,
  FaTv,
  FaSignOutAlt,
  FaHome,
  FaSignInAlt,
} from "react-icons/fa"; // Import icons
import { useState } from "react";

const Sidebar = ({
  open,
  setPanelIndex,
  panelIndex,
  onToggleSidebar,
  isLoggedIn,
  onLogout,
  sideBarDisplay,
  ...props
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const handleSidebarFocus = () => {
    onToggleSidebar({ open: true });
  };

  if (open) {
    const currentNavLink = document.querySelector(".nav-link.current");
    // Focus the topmost navigation link
    if (currentNavLink) {
      currentNavLink.focus();
    }
  }

  const handleSidebarBlur = () => {
    onToggleSidebar({ open: false });
  };
  return (
    <Cell
      component="nav"
      size={open ? "20%" : "7%"}
      onFocus={handleSidebarFocus}
      onBlur={handleSidebarBlur}
      {...props}
    >
      <Item
        onClick={() => setPanelIndex(0) && setCurrentIndex(0)}
        className={currentIndex === 0 ? "nav-link current" : "nav-link"}
      >
        {open ? (
          <>
            <FaHome /> Home
          </>
        ) : (
          <FaHome />
        )}
      </Item>
      <Item
        onClick={() => setPanelIndex(3) && setCurrentIndex(3)}
        className={currentIndex === 3 ? "nav-link current" : "nav-link"}
      >
        {open ? (
          <>
            <FaFilm /> Movies
          </>
        ) : (
          <FaFilm />
        )}
      </Item>
      <Item
        onClick={() => setPanelIndex(4) && setCurrentIndex(4)}
        className={currentIndex === 4 ? "nav-link current" : "nav-link"}
      >
        {open ? (
          <>
            <FaTv /> Tv Shows
          </>
        ) : (
          <FaTv />
        )}
      </Item>
      <Item
        onClick={
          isLoggedIn ? onLogout : () => setPanelIndex(5) && setCurrentIndex(5)
        }
        className={currentIndex === 5 ? "nav-link current" : "nav-link"}
      >
        {open ? (
          <>
            {isLoggedIn ? <FaSignOutAlt /> : <FaSignInAlt />}{" "}
            {isLoggedIn ? "Logout" : "Login"}
          </>
        ) : isLoggedIn ? (
          <FaSignOutAlt />
        ) : (
          <FaSignInAlt />
        )}
      </Item>
    </Cell>
  );
};

export default Sidebar;
