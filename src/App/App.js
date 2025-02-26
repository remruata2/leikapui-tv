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
import Device from "../views/Device/Device";
import css from "./App.module.less";
import Changeable from "@enact/ui/Changeable";
import PropTypes from "prop-types";
import Popup from "@enact/sandstone/Popup";
import { StorageService } from "../utils/storage";
import { Spotlight } from "@enact/spotlight";

const AppBase = ({ open, onToggleSidebar, ...rest }) => {
	const [panelIndex, setPanelIndex] = useState(0);
	const [selectedMovieId, setSelectedMovieId] = useState(null);
	const [sideBarDisplay, setSideBarDisplay] = useState(true);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [showLogoutPopup, setShowLogoutPopup] = useState(false);
	const [navigationStack, setNavigationStack] = useState([0]);

	useEffect(() => {
		const checkAuthentication = async () => {
			const authData = StorageService.getItem("authData");
			if (authData?.token) {
				setIsLoggedIn(true);
			} else {
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
					setIsLoggedIn(false);
				}
			}
		};

		checkAuthentication();
	}, []);

	useEffect(() => {
		const token = window.localStorage.getItem("token");
		setIsLoggedIn(!!token);
	}, []);

	useEffect(() => {
		const handleKeyDown = (e) => {
			const keycode = e.keyCode || e.which;
			if (keycode === 461) {
				// WebOS back button keycode
				e.preventDefault();
				console.log("Back button pressed - Current panel index:", panelIndex);
				if (panelIndex > 0) {
					setPanelIndex((prevIndex) => prevIndex - 1);
				} else if (window.webOS && window.webOS.platformBack) {
					// Only show exit dialog on home panel
					window.webOS.platformBack();
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [panelIndex]);

	const onLogout = async () => {
		try {
			await StorageService.removeItem("authData");
			setIsLoggedIn(false);
			setShowLogoutPopup(true);
		} catch (error) {
			console.error("Error logging out:", error);
		}
	};

	const handleBack = () => {
		setNavigationStack((prev) => {
			const newStack = prev.slice(0, -1);
			// Force focus reset when navigating back
			setTimeout(() => {
				const currentPanel = newStack[newStack.length - 1] || 0;
				const focusMap = {
					0: '[data-spotlight-id="home-main"]',
					1: '[data-spotlight-id="movies-grid"]',
					2: '[data-spotlight-id="tvshows-grid"]',
				};
				const selector = focusMap[currentPanel];
				if (selector) {
					const element = document.querySelector(selector);
					if (element) Spotlight.focus(element);
				}
			}, 50);
			return newStack;
		});
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
				setSideBarDisplay={setSideBarDisplay}
				handleLogout={() => {
					window.localStorage.removeItem("token");
					setIsLoggedIn(false);
				}}
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
						panelIndex={panelIndex}
						isLoggedIn={isLoggedIn}
					/>
				</Panel>
				<Panel>
					<MovieDetail
						selectedMovieId={selectedMovieId}
						setPanelIndex={setPanelIndex}
						isLoggedIn={isLoggedIn}
					/>
				</Panel>
				<Panel>
					<TvShowDetail
						selectedMovieId={selectedMovieId}
						setPanelIndex={setPanelIndex}
						isLoggedIn={isLoggedIn}
					/>
				</Panel>
				<Panel>
					<Movies
						setPanelIndex={setPanelIndex}
						setSelectedMovieId={setSelectedMovieId}
						isLoggedIn={isLoggedIn}
					/>
				</Panel>
				<Panel>
					<TvShows
						setPanelIndex={setPanelIndex}
						setSelectedMovieId={setSelectedMovieId}
						isLoggedIn={isLoggedIn}
					/>
				</Panel>
				<Panel>
					{!isLoggedIn ? (
						<Login
							setIsLoggedIn={setIsLoggedIn}
							setPanelIndex={setPanelIndex}
						/>
					) : (
						<Profile isLoggedIn={isLoggedIn} setPanelIndex={setPanelIndex} />
					)}
				</Panel>
				{isLoggedIn && (
					<>
						<Panel>
							<Device isLoggedIn={isLoggedIn} setPanelIndex={setPanelIndex} />
						</Panel>
						{/* Add future protected panels here */}
					</>
				)}
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
