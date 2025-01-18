import { useState, useEffect } from "react";
import { Panels, Panel } from "@enact/sandstone/Panels";
import ThemeDecorator from "@enact/sandstone/ThemeDecorator";
import { Row } from "@enact/ui/Layout";
import Sidebar from "../components/sidebar/Sidebar";
import Home from "../views/Home/Home";
import Movies from "../views/Movies/Movies";
import TvShows from "../views/TvShows/TvShows";
import MovieDetail from "../views/MovieDetail/MovieDetail";
import TvShowDetail from "../views/TvShowDetail/TvShowDetail";
import Login from "../views/Login/Login";
import Profile from "../views/Profile/Profile";
import css from "./App.module.less";
import Changeable from "@enact/ui/Changeable";
import PropTypes from "prop-types";
import Popup from "@enact/sandstone/Popup";

const AppBase = ({ open, onToggleSidebar, ...rest }) => {
  const [panelIndex, setPanelIndex] = useState(0);
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [sideBarDisplay, setSideBarDisplay] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/auth/isAuthenticated`,
          {
            credentials: "include",
          }
        );
        const data = await response.json();
        setIsLoggedIn(data.isAuthenticated);
      } catch (error) {
        console.error("Error checking authentication:", error);
      }
    };

    checkAuthentication();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // 461 is the keyCode for the back button on LG remote
      if (e.keyCode === 461) {
        e.preventDefault();
        if (panelIndex > 0) {
          setPanelIndex(panelIndex - 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [panelIndex]);

  const onLogout = async () => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/logout`, {
        credentials: "include",
      });
      setIsLoggedIn(false);
      setShowLogoutPopup(true);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleBack = () => {
    if (panelIndex > 0) {
      setPanelIndex(panelIndex - 1);
      return true; // Prevent default back behavior
    }
    return false; // Allow default back behavior when on home panel
  };

  const handlePanelsKeyDown = (ev) => {
    onToggleSidebar(ev, { onToggleSidebar, open });
  };

  const handlePopupClose = () => {
    setShowLogoutPopup(false);
  };

  return (
    <Row>
      <Sidebar
        open={open}
        setPanelIndex={setPanelIndex}
        onToggleSidebar={onToggleSidebar}
        panelIndex={panelIndex}
        className={`${css.sidebar} ${open ? css.sideBarOpened : ""}`}
        isLoggedIn={isLoggedIn}
        onLogout={onLogout}
        sideBarDisplay={sideBarDisplay}
      />

      <Panels
        {...rest}
        onKeyDown={handlePanelsKeyDown}
        className={css.sideBarClosed}
        index={panelIndex}
        onBack={handleBack}
      >
        <Panel>
          <Home
            setPanelIndex={setPanelIndex}
            setSelectedMovieId={setSelectedMovieId}
          />
        </Panel>
        <Panel>
          <MovieDetail
            selectedMovieId={selectedMovieId}
            setSidebarDisplay={setSideBarDisplay}
            onBack={handleBack}
          />
        </Panel>
        <Panel>
          <TvShowDetail
            selectedMovieId={selectedMovieId}
            setSidebarDisplay={setSideBarDisplay}
            onBack={handleBack}
          />
        </Panel>
        <Panel>
          <Movies onBack={handleBack} />
        </Panel>
        <Panel>
          <TvShows onBack={handleBack} />
        </Panel>
        <Panel>
          {panelIndex === 5 && <Profile />}
        </Panel>
        <Panel>
          {panelIndex === 6 && <Login setPanelIndex={setPanelIndex} />}
        </Panel>
      </Panels>

      <Popup open={showLogoutPopup} onClose={handlePopupClose}>
        Successfully logged out
      </Popup>
    </Row>
  );
};

AppBase.propTypes = {
  open: PropTypes.bool,
  onToggleSidebar: PropTypes.func,
};

const App = Changeable({
  prop: "open",
  change: "onToggleSidebar",
})(AppBase);

export default ThemeDecorator(App);
