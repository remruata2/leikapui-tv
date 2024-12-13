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
import css from "./App.module.less";
import Spottable from "@enact/spotlight/Spottable";
import Changeable from "@enact/ui/Changeable";
import PropTypes from "prop-types";
import Popup from "@enact/sandstone/Popup";
import Spotlight from "@enact/spotlight";

const AppBase = ({ open, onToggleSidebar, ...rest }) => {
  const [panelIndex, setPanelIndex] = useState(0);
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [sideBarDisplay, setSideBarDisplay] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/isAuthenticated`, {
          credentials: "include", // Include cookies in the request
        });
        const data = await response.json();
        setIsLoggedIn(data.isAuthenticated);
      } catch (error) {
        console.error("Error checking authentication:", error);
      }
    };

    checkAuthentication();
  }, []);

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

  return (
    <Row>
      <Sidebar
        open={open}
        setPanelIndex={setPanelIndex}
        onToggleSidebar={onToggleSidebar}
        panelIndex={panelIndex}
        className={css.sidebar}
        isLoggedIn={isLoggedIn}
        onLogout={onLogout}
        sideBarDisplay={sideBarDisplay}
      />

      <Panels
        {...rest}
        onKeyDown={(ev) => onToggleSidebar(ev, { onToggleSidebar, open })}
        className={open ? css.sideBarOpened : css.sideBarClosed}
        index={panelIndex}
        onBack={() => setPanelIndex(0)}
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
          />
        </Panel>
        <Panel>
          <TvShowDetail selectedMovieId={selectedMovieId} />
        </Panel>
        <Panel>
          <Movies />
        </Panel>
        <Panel>
          <TvShows />
        </Panel>
        <Panel>
          <Login />
        </Panel>
      </Panels>

      <Popup open={showLogoutPopup} onClose={() => setShowLogoutPopup(false)}>
        Successfully logged out
      </Popup>
    </Row>
  );
};

AppBase.propTypes = {
  open: PropTypes.bool,
  onToggleSidebar: PropTypes.func,
};

AppBase.defaultProps = {
  open: false,
};

const App = Changeable(
  { prop: "open", change: "onToggleSidebar" },
  ThemeDecorator(Spottable(AppBase))
);

export default App;
export { App, AppBase };
