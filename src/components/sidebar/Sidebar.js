import { useState, useCallback } from "react";
import css from "./Sidebar.module.less";
import {
	RiHome5Fill,
	RiMovie2Fill,
	RiUser3Fill,
} from "react-icons/ri";
import { BiLogOut, BiLogIn } from "react-icons/bi";
import Item from "@enact/sandstone/Item";
import SpotlightContainerDecorator from "@enact/spotlight/SpotlightContainerDecorator";
import { Spotlight } from "@enact/spotlight";
import "./transparentOverride.css";
import Image from "@enact/sandstone/Image";

// Simple wrapper component for menu items
const TransparentItemWrapper = ({ children, className }) => {
	return (
		<div
			className={className}
			style={{
				backgroundColor: "transparent",
				position: "relative",
			}}
			data-no-background="true"
		>
			{children}
		</div>
	);
};

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

	// Sidebar menu items based on App.js
	const menuItems = [
		{
			icon: <RiHome5Fill className={css.icon} />,
			label: "Home",
			panelIndex: 0,
			show: true,
			action: null,
		},
		{
			icon: <RiMovie2Fill className={css.icon} />,
			label: "Movies",
			panelIndex: 3,
			show: true,
			action: null,
		},

		{
			icon: <RiUser3Fill className={css.icon} />,
			label: "Profile",
			panelIndex: 5,
			show: isLoggedIn,
			action: null,
		},
		{
			icon: isLoggedIn ? (
				<BiLogOut className={css.icon} />
			) : (
				<BiLogIn className={css.icon} />
			),
			label: isLoggedIn ? "Logout" : "Login",
			panelIndex: 5,
			show: true,
			action: isLoggedIn ? "logout" : "login",
		},
	];
	const visibleItems = menuItems.filter((item) => item.show);
	const lastIndex = visibleItems.length;

	const handleItemClick = (itemIdx) => {
		const item = visibleItems[itemIdx];
		if (item.action === "logout") {
			onLogout?.();
		} else if (item.action === "login") {
			setPanelIndex(5); // Login panel
			onToggleSidebar?.({ open: false });
		} else {
			setPanelIndex(item.panelIndex);
			onToggleSidebar?.({ open: false });
		}
	};

	const handleSidebarFocus = () => {
		setFocusedIndex(0);
		onToggleSidebar?.({ open: true });
		// Explicitly set Enact Spotlight focus to the Home menu item
		setTimeout(() => {
			Spotlight.focus("[data-spotlight-id='menu-item-0']");
		}, 0);
	};

	const handleSidebarBlur = (e) => {
		if (e.relatedTarget && !e.currentTarget.contains(e.relatedTarget)) {
			onToggleSidebar?.({ open: false });
		}
	};

	const handleKeyDown = useCallback(
		(e) => {
			if (e.keyCode === 40) {
				// Down
				if (focusedIndex === lastIndex) {
					e.preventDefault();
					e.stopPropagation();
					return;
				}
				setFocusedIndex((prev) => Math.min(prev + 1, lastIndex));
				e.preventDefault();
				e.stopPropagation();
			} else if (e.keyCode === 38) {
				// Up
				if (focusedIndex === 0) {
					e.preventDefault();
					e.stopPropagation();
					return;
				}
				setFocusedIndex((prev) => Math.max(prev - 1, 0));
				e.preventDefault();
				e.stopPropagation();
			} else if (e.keyCode === 13) {
				// Enter
				handleItemClick(focusedIndex);
				e.preventDefault();
				e.stopPropagation();
			}
		},
		[focusedIndex, lastIndex, handleItemClick]
	);

	if (!sideBarDisplay) return null;

	return (
		<div
			className={`${css.sidebar} ${!open ? css.closed : ""} ${className || ""}`}
			tabIndex={0}
			onFocus={handleSidebarFocus}
			onBlur={handleSidebarBlur}
			onKeyDown={handleKeyDown}
			role="navigation"
			aria-label="Sidebar Navigation"
		>
			<Image src="/logo.png" alt="App Logo" className={css.logo} />
			<div className={css.menuContainer}>
				{visibleItems.map((item, idx) => (
					<TransparentItemWrapper key={item.label}>
						<Item
							onClick={() => handleItemClick(idx)}
							className={
								`${css.menuItem} ` +
								(panelIndex === item.panelIndex && !item.action
									? css.active
									: "") +
								(focusedIndex === idx ? ` ${css.focused}` : "") +
								(item.action ? ` ${css.loginItem}` : "")
							}
							spotlightId={
								item.action
									? isLoggedIn
										? "logout-item"
										: "login-item"
									: `menu-item-${idx}`
							}
							style={{
								backgroundColor: "transparent",
								background: "none",
							}}
							onFocus={() => setFocusedIndex(idx)}
							tabIndex={0}
						>
							<div className={css.itemContent}>
								{item.icon}
								<span className={css.label}>{item.label}</span>
							</div>
						</Item>
					</TransparentItemWrapper>
				))}
			</div>
		</div>
	);
};

const SidebarDecorator = SpotlightContainerDecorator({
	enterTo: "default-element",
	defaultElement: '[data-spotlight-id="menu-item-0"]',
	continue5WayHold: true, // Add this to improve navigation between panels and sidebar
});

export default SidebarDecorator(Sidebar);
