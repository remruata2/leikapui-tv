import { useState, useEffect, useCallback } from "react";
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
// VideoPlayerPanel removed - using VideoPlayer directly in MovieDetail
import css from "./App.module.less";
import Changeable from "@enact/ui/Changeable";
import PropTypes from "prop-types";
import Popup from "@enact/sandstone/Popup";
import { StorageService } from "../utils/storage";
import { Spotlight } from "@enact/spotlight";

const AppBase = ({ open, onToggleSidebar, ...rest }) => {
	const [panelIndex, setPanelIndex] = useState(0);
  const [selectedMovieId, setSelectedMovieIdState] = useState(() => {
    return window.localStorage.getItem('selectedMovieId') || null;
  });

  const setSelectedMovieId = useCallback((id) => {
    setSelectedMovieIdState(id);
    if (id) {
      window.localStorage.setItem('selectedMovieId', id);
    } else {
      window.localStorage.removeItem('selectedMovieId');
    }
  }, []);
	const [isVideoPlayerActive, setIsVideoPlayerActive] = useState(false); // Track video player state
	const [sideBarDisplay, setSideBarDisplay] = useState(true);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [showLoginSuccessPopup, setShowLoginSuccessPopup] = useState(false);
  const [navigationStack, setNavigationStack] = useState([0]);

 	// Create a custom panel index setter that also updates navigation history and tracks last accessed panel
 	const setPanel = useCallback((index) => {
 		// Don't add duplicate consecutive entries
 		if (index !== panelIndex) {
 			console.log(`Navigation: ${panelIndex} -> ${index}`);
 			// If trying to navigate to movie/TV detail without a selected item, redirect to home
 			if ((index === 1 || index === 2) && !selectedMovieId) {
 				index = 0;
 			}
 			// Update the actual panel index
 			setPanelIndex(index);
 			// Store the last accessed panel in localStorage (except for login page)
 			if (index !== 5) { // Skip saving login page
 				window.localStorage.setItem('lastPanelIndex', index.toString());
 			}
 			// Add to navigation stack if moving to a new panel
 			setNavigationStack(prev => {
 				// Check if we're already on this panel
 				if (prev[prev.length - 1] !== index) {
 					return [...prev, index];
 				}
 				return prev;
 			});
 			// Close sidebar when navigating away from login panel
 			if (index !== 5) {
 				onToggleSidebar({ open: false });
 			}
 		}
 	}, [panelIndex, selectedMovieId, onToggleSidebar]);

	// Improved back navigation handler
	const handleBackNavigation = useCallback(() => {
		// Only proceed if we have somewhere to go back to
		if (navigationStack.length <= 1) {
			console.log("No previous page in navigation stack");
			return;
		}

		setNavigationStack((prev) => {
			// Remove current page from stack
			const newStack = prev.slice(0, -1);
			// Get previous page
			const previousPanel = newStack[newStack.length - 1] || 0;
			console.log(`Going back to panel ${previousPanel} from ${panelIndex}`);

			// Update panel index directly (no need to add to stack)
			setPanelIndex(previousPanel);

			// Force focus reset when navigating back
			setTimeout(() => {
				// Updated focus map to match panel structure
				const focusMap = {
					0: '[data-spotlight-id="home-main"]',
					1: '[data-spotlight-id="movie-detail"]',
					2: '[data-spotlight-id="tvshow-detail"]',
					3: '[data-spotlight-id="movies-grid"]',
					4: '[data-spotlight-id="tvshows-grid"]',
					5: '[data-spotlight-id="profile-container"]',
				};
				const selector = focusMap[previousPanel];
				if (selector) {
					const element = document.querySelector(selector);
					if (element) {
						console.log(`Setting focus to ${selector}`);
						Spotlight.focus(element);
					} else {
						console.log(`Element not found for selector ${selector}`);
					}
				}
			}, 50);

			return newStack;
		});
	}, [navigationStack.length, panelIndex]);

	// Check if user is already logged in
	useEffect(() => {
		const authData = StorageService.getItem('authData');
		if (authData && authData.token) {
			setIsLoggedIn(true);
		}
		// We'll initialize login state from localStorage only
		// Don't need to call checkAuthentication() here
	}, []);

	// Add keyboard event listener for back button simulation
	useEffect(() => {
		const handleKeyboardBack = (e) => {
			// Only process if not in an input field
			if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
				// Map Escape or Backspace to the WebOS back button behavior
				if (e.key === 'Escape' || e.key === 'Backspace') {
					e.preventDefault();
					console.log("Keyboard back pressed - Current panel index:", panelIndex);

					// Use navigation stack for more robust back navigation
					if (navigationStack.length > 1) {
						handleBackNavigation();
					} else if (panelIndex > 0) {
						// Fallback to simple panel navigation
						setPanel(0); // Go to home
					}
				}
			}
		};

		// Add event listener
		window.addEventListener('keydown', handleKeyboardBack);

		// Clean up
		return () => window.removeEventListener('keydown', handleKeyboardBack);
	}, [panelIndex, navigationStack, handleBackNavigation, setPanel]);

	// --- Focus Management for Panel Switching ---
	useEffect(() => {
		if (!sideBarDisplay) {
			// Only restore focus when sidebar is closed
			const focusMap = {
				0: '[spotlightid="banner-container"]', // Home
				1: '[data-spotlight-id="movie-detail-scroller"]', // MovieDetail
				2: '[data-spotlight-id="tvshow-detail-scroller"]', // TvShowDetail
				3: '[data-spotlight-id="movies-grid"]', // Movies page
				4: '[data-spotlight-id="tvshows-grid"]', // TV Shows page
				5: '[data-spotlight-id="profile-main"]', // Profile page
				6: '[data-spotlight-id="video-player"]', // Video Player panel
			};
			const selector = focusMap[panelIndex];
			if (selector) {
				setTimeout(() => {
					const el = document.querySelector(selector);
					if (el) {
						Spotlight.focus(el);
					}
				}, 100);
			}
		}
	}, [panelIndex, sideBarDisplay]);

	const silentLogout = async () => {
		try {
			await StorageService.removeItem("authData");
			window.localStorage.removeItem("token");
			setIsLoggedIn(false);
		} catch (error) {
			console.error("Error in silent logout:", error);
		}
	};

	useEffect(() => {
		const checkAuthentication = async () => {
			const token = window.localStorage.getItem("token");
			const authData = StorageService.getItem("authData");

			if (token || authData?.token) {
				// Check if token is still valid by calling API
				try {
					const response = await fetch(
						`${process.env.REACT_APP_API_URL}/auth/isAuthenticated`,
						{
							credentials: "include",
							headers: {
								Authorization: `Bearer ${authData?.token || token}`,
							},
						}
					);
					const data = await response.json();
					if (data.isAuthenticated) {
						setIsLoggedIn(true);
					} else {
						await silentLogout();
					}
				} catch (error) {
					console.error("Error checking authentication:", error);
					await silentLogout();
				}
			} else {
				// No local auth data, logout silently
				await silentLogout();
			}
		};

		checkAuthentication();
	}, [panelIndex]);

	// Check authentication on window focus
	useEffect(() => {
		const handleFocus = () => {
			const token = window.localStorage.getItem("token");
			const authData = StorageService.getItem("authData");
			if (!token && !authData?.token) {
				silentLogout();
			}
		};

		window.addEventListener("focus", handleFocus);
		return () => window.removeEventListener("focus", handleFocus);
	}, []);

	useEffect(() => {
		const handleKeyDown = (e) => {
			const keycode = e.keyCode || e.which;
			if (keycode === 461) {
				// WebOS back button keycode
				e.preventDefault();
				console.log("Back button pressed - Current panel index:", panelIndex);

				// Always use the navigation stack for back navigation
				if (navigationStack.length > 1) {
					handleBackNavigation();
				} else if (panelIndex > 0) {
					// Fallback to home if no history
					setPanel(0);
				} else if (window.webOS && window.webOS.platformBack) {
					// Only show exit dialog on home panel
					window.webOS.platformBack();
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [panelIndex, navigationStack.length, handleBackNavigation, setPanel]);

  const onLogout = async () => {
 		try {
 			await StorageService.removeItem("authData");
 			window.localStorage.removeItem("token");
 			window.localStorage.removeItem("selectedMovieId");
 			setSelectedMovieId(null);
 			setIsLoggedIn(false);
 			setShowLogoutPopup(true);
 		} catch (error) {
 			console.error("Error logging out:", error);
 		}
 	};

	const handlePanelsKeyDown = useCallback((ev) => {
		// Handle WebOS back button press
		const keycode = ev.keyCode || ev.which;
		if (keycode === 461) {
			// Process back button logic directly
			ev.preventDefault();
			console.log("Back button pressed - Current panel index:", panelIndex);

			// Always use the navigation stack for back navigation
			if (navigationStack.length > 1) {
				handleBackNavigation();
			} else if (panelIndex > 0) {
				// Fallback to home if no history
				setPanel(0);
			} else if (window.webOS && window.webOS.platformBack) {
				// Only show exit dialog on home panel
				window.webOS.platformBack();
			}
		}
	}, [panelIndex, navigationStack.length, handleBackNavigation, setPanel]);

	const handlePopupClose = () => {
		setShowLogoutPopup(false);
	};

	const handleLogout = () => {
		window.localStorage.removeItem("token");
		setIsLoggedIn(false);
	};

	const handleTransition = (e) => {
		// Handle panel transition if needed
		console.log("Panel transition:", e);
		// Navigation is now handled by setPanel
	};

	const handleMovieSelect = useCallback((movieId) => {
		console.log(`Selected movie: ${movieId}`);
		setSelectedMovieId(movieId);
		setPanel(1); // Navigate to MovieDetail panel
	}, [setPanel]);

	// Video player visibility control
	const setVideoPlayerActive = (isActive) => {
		setIsVideoPlayerActive(isActive);
	};

	return (
		<Row>
			<Panels
				{...rest}
				onKeyDown={handlePanelsKeyDown}
				index={panelIndex}
				onTransition={handleTransition}
				className={`${css.mainContent} ${open ? css.sideBarOpened : ""}`}
			>
				<Panel>
					<Home
						setPanelIndex={setPanel}
						setSelectedMovieId={setSelectedMovieId}
						panelIndex={panelIndex}
						isLoggedIn={isLoggedIn}
						onMovieSelect={handleMovieSelect}
					/>
				</Panel>
				<Panel key={`movie-detail-${isLoggedIn}`}>
					<MovieDetail
						selectedMovieId={selectedMovieId}
						setPanelIndex={setPanel}
						isLoggedIn={isLoggedIn}
						setVideoPlayerActive={setVideoPlayerActive}
					/>
				</Panel>
				<Panel key={`tvshow-detail-${isLoggedIn}`}>
					<TvShowDetail
						selectedMovieId={selectedMovieId}
						setPanelIndex={setPanel}
						isLoggedIn={isLoggedIn}
					/>
				</Panel>
				<Panel>
					<Movies
						setPanelIndex={setPanel}
						setSelectedMovieId={setSelectedMovieId}
						isLoggedIn={isLoggedIn}
						onMovieSelect={handleMovieSelect}
					/>
				</Panel>
				<Panel>
					<TvShows
						setPanelIndex={setPanel}
						setSelectedMovieId={setSelectedMovieId}
					/>
				</Panel>
				<Panel>
					{isLoggedIn ? (
						<>
							<Profile
								isLoggedIn={isLoggedIn}
							/>
							<Device />
							{/* Add future protected panels here */}
						</>
					) : (
 						<Login
 							setIsLoggedIn={setIsLoggedIn}
 							setPanelIndex={setPanel}
 							setShowLoginSuccessPopup={setShowLoginSuccessPopup}
 						/>
					)}
				</Panel>
			</Panels>

 			<Popup
 				open={showLogoutPopup}
 				onClose={handlePopupClose}
 				noAutoDismiss={false}
 			>
 				Successfully logged out
 			</Popup>
 			<Popup
 				open={showLoginSuccessPopup}
 				onClose={() => setShowLoginSuccessPopup(false)}
 				closeButton
 				spotlightRestrict="self-only"
 				style={{ padding: "1rem" }}
 			>
 				<div>Login Successful! Welcome back.</div>
 			</Popup>
			{!isVideoPlayerActive && (
				<Sidebar
					key={isLoggedIn ? 'logged-in' : 'logged-out'}
					open={open}
					setPanelIndex={setPanel}
					onToggleSidebar={onToggleSidebar}
					panelIndex={panelIndex}
					className={`${css.sidebar} ${open ? css.sideBarOpened : ""}`}
					isLoggedIn={isLoggedIn}
					onLogout={onLogout}
					sideBarDisplay={sideBarDisplay}
					setSideBarDisplay={setSideBarDisplay}
					handleLogout={handleLogout}
					style={{ zIndex: 20 }}
				/>
			)}
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
