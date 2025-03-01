import { useState, useCallback } from "react";
import css from "./Sidebar.module.less";
import {
	RiHome5Fill,
	RiMovie2Fill,
	RiTvFill,
	RiUser3Fill,
	RiDeviceFill,
} from "react-icons/ri";
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

	const settingsItems = [
		{
			icon: <RiUser3Fill className={css.icon} />,
			label: "Profile",
			index: 5,
		},
	];

	const handleItemClick = (index, panelIdx) => {
		console.log("Item clicked:", index, panelIdx);
		// Redirect to login if trying to access protected routes
		if (!isLoggedIn && panelIdx >= 5) {
			setPanelIndex(5); // Login panel index
		} else {
			console.log("Setting panel index to:", panelIdx);
			setPanelIndex(panelIdx);
		}
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
		// Only close if focus moved to a non-null element outside sidebar
		if (e.relatedTarget && !e.currentTarget.contains(e.relatedTarget)) {
			onToggleSidebar({ open: false });
		}
	};

	const handleKeyDown = useCallback(
		(e) => {
			console.log(
				"Key pressed in sidebar:",
				e.keyCode,
				"Current focus:",
				focusedIndex
			);

			if (e.keyCode === 40) {
				// Down arrow
				e.preventDefault();
				e.stopPropagation();

				const allItems = [
					...menuItems,
					...(isLoggedIn ? settingsItems : []),
					{ isLoginLogout: true },
				];
				const nextIndex = Math.min(focusedIndex + 1, allItems.length - 1);

				console.log("Moving to index:", nextIndex);

				let nextElement;
				if (nextIndex < menuItems.length) {
					nextElement = document.querySelector(
						`[data-spotlight-id="menu-item-${nextIndex}"]`
					);
				} else if (
					isLoggedIn &&
					nextIndex < menuItems.length + settingsItems.length
				) {
					const settingsIndex = nextIndex - menuItems.length;
					nextElement = document.querySelector(
						`[data-spotlight-id="settings-item-${settingsIndex}"]`
					);
				} else {
					nextElement = document.querySelector(
						`[data-spotlight-id="${isLoggedIn ? "logout-item" : "login-item"}"]`
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

				const prevIndex = Math.max(0, focusedIndex - 1);

				let prevElement;
				if (prevIndex < menuItems.length) {
					prevElement = document.querySelector(
						`[data-spotlight-id="menu-item-${prevIndex}"]`
					);
				} else if (
					isLoggedIn &&
					prevIndex < menuItems.length + settingsItems.length
				) {
					const settingsIndex = prevIndex - menuItems.length;
					prevElement = document.querySelector(
						`[data-spotlight-id="settings-item-${settingsIndex}"]`
					);
				} else {
					prevElement = document.querySelector(
						`[data-spotlight-id="${isLoggedIn ? "logout-item" : "login-item"}"]`
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

				const allItems = [
					...menuItems,
					...(isLoggedIn ? settingsItems : []),
					{ isLoginLogout: true },
				];

				if (focusedIndex === allItems.length - 1) {
					// If login/logout item is focused
					if (isLoggedIn) {
						onLogout();
					} else {
						handleItemClick(focusedIndex, 5); // Login panel is at index 5
					}
				} else if (
					isLoggedIn &&
					focusedIndex >= menuItems.length &&
					focusedIndex < menuItems.length + settingsItems.length
				) {
					const currentItem = settingsItems[focusedIndex - menuItems.length];
					handleItemClick(focusedIndex, currentItem.index);
				} else {
					const currentItem = menuItems[focusedIndex];
					handleItemClick(focusedIndex, currentItem.index);
				}
			}
		},
		[
			focusedIndex,
			menuItems,
			settingsItems,
			isLoggedIn,
			onLogout,
			handleItemClick,
		]
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
				{/* Main Menu Items */}
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

				{/* Settings Items - Only show when logged in */}
				{isLoggedIn && (
					<>
						<div className={css.settingsDivider} />
						<div className={css.settingsHeader}>Settings</div>

						{settingsItems.map((item, index) => (
							<Item
								key={index}
								onClick={() =>
									handleItemClick(index + menuItems.length, item.index)
								}
								className={`${css.menuItem} ${
									item.index === panelIndex ? css.active : ""
								} ${
									focusedIndex === index + menuItems.length ? css.focused : ""
								}`}
								spotlightId={`settings-item-${index}`}
								onFocus={() => setFocusedIndex(index + menuItems.length)}
								tabIndex={0}
							>
								<div className={css.itemContent}>
									{item.icon}
									<span className={css.label}>{item.label}</span>
								</div>
							</Item>
						))}
					</>
				)}

				{/* Login/Logout Item */}
				{isLoggedIn ? (
					<Item
						onClick={onLogout}
						className={`${css.menuItem} ${
							focusedIndex ===
							menuItems.length + (isLoggedIn ? settingsItems.length : 0)
								? css.focused
								: ""
						}`}
						spotlightId="logout-item"
						onFocus={() =>
							setFocusedIndex(
								menuItems.length + (isLoggedIn ? settingsItems.length : 0)
							)
						}
						tabIndex={0}
					>
						<div className={css.itemContent}>
							<BiLogOut className={css.icon} />
							<span className={css.label}>Logout</span>
						</div>
					</Item>
				) : (
					<Item
						onClick={() =>
							handleItemClick(
								menuItems.length + (isLoggedIn ? settingsItems.length : 0),
								5 // Login panel is at index 5
							)
						}
						className={`${css.menuItem} ${
							focusedIndex ===
							menuItems.length + (isLoggedIn ? settingsItems.length : 0)
								? css.focused
								: ""
						}`}
						spotlightId="login-item"
						onFocus={() =>
							setFocusedIndex(
								menuItems.length + (isLoggedIn ? settingsItems.length : 0)
							)
						}
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
