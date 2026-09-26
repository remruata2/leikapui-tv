import { useCallback, useRef } from "react";
import Spotlight from "@enact/spotlight";
import Spottable from "@enact/spotlight/Spottable";
import SpotlightContainerDecorator from "@enact/spotlight/SpotlightContainerDecorator";
import {
	RiHome5Fill,
	RiMovie2Fill,
	RiUser3Fill,
} from "react-icons/ri";
import { BiLogOut, BiLogIn } from "react-icons/bi";
import css from "./Sidebar.module.less";

const SpottableItem = Spottable("div");

const Sidebar = ({
	open,
	onToggleSidebar,
	setPanelIndex,
	panelIndex,
	isLoggedIn,
	onLogout,
	sideBarDisplay,
	className,
	...rest
}) => {
	const containerRef = useRef(null);

	const menuItems = [
		{
			id: "home",
			icon: <RiHome5Fill className={css.icon} />,
			label: "Home",
			panelIndex: 0,
			show: true,
			action: null,
		},
		{
			id: "movies",
			icon: <RiMovie2Fill className={css.icon} />,
			label: "Movies",
			panelIndex: 3,
			show: true,
			action: null,
		},
		{
			id: "profile",
			icon: <RiUser3Fill className={css.icon} />,
			label: "Profile",
			panelIndex: 5,
			show: isLoggedIn,
			action: null,
		},
		{
			id: "auth",
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

	const handleItemClick = useCallback(
		(itemIdx) => {
			const item = visibleItems[itemIdx];
			if (!item) return;

			if (item.action === "logout") {
				onLogout?.();
			} else if (item.action === "login") {
				setPanelIndex(5);
				onToggleSidebar?.({ open: false });
			} else {
				setPanelIndex(item.panelIndex);
				onToggleSidebar?.({ open: false });
			}
		},
		[visibleItems, onLogout, setPanelIndex, onToggleSidebar]
	);

	const handleItemFocus = useCallback(() => {
		onToggleSidebar?.({ open: true });
	}, [onToggleSidebar]);

	const handleContainerBlur = useCallback(
		(e) => {
			if (e.relatedTarget && !e.currentTarget.contains(e.relatedTarget)) {
				onToggleSidebar?.({ open: false });
			}
		},
		[onToggleSidebar]
	);

	const focusSidebarItem = (targetIdx) => {
		const targetId = `sidebar-item-${targetIdx}`;
		const el = document.querySelector(`[data-spotlight-id="${targetId}"]`);
		if (el) {
			if (!Spotlight.focus(el)) {
				el.focus();
			}
		} else {
			Spotlight.focus(targetId);
		}
	};

	// 5-way D-pad remote navigation between sidebar items
	const handleSpotlightDown = useCallback(
		(idx, ev) => {
			if (idx < visibleItems.length - 1) {
				ev.preventDefault();
				ev.stopPropagation();
				focusSidebarItem(idx + 1);
			}
		},
		[visibleItems.length]
	);

	const handleSpotlightUp = useCallback((idx, ev) => {
		if (idx > 0) {
			ev.preventDefault();
			ev.stopPropagation();
			focusSidebarItem(idx - 1);
		}
	}, []);

	const handleSpotlightRight = useCallback(
		(ev) => {
			ev.preventDefault();
			ev.stopPropagation();
			onToggleSidebar?.({ open: false });

			setTimeout(() => {
				const mainTarget =
					document.querySelector('[data-spotlight-id^="banner-play-btn"]') ||
					document.querySelector('[data-spotlight-id^="movie-card"]') ||
					document.querySelector('#root .spottable');
				if (mainTarget) {
					if (!Spotlight.focus(mainTarget)) {
						mainTarget.focus?.();
					}
				} else {
					Spotlight.focus();
				}
			}, 60);
		},
		[onToggleSidebar]
	);

	if (!sideBarDisplay) return null;

	return (
		<nav
			{...rest}
			ref={containerRef}
			className={`${css.sidebarContainer} ${open ? css.open : ""} ${className || ""}`}
			onBlur={handleContainerBlur}
			role="navigation"
			aria-label="Sidebar Navigation"
		>
			<div className={css.topSection}>
				<div className={css.logoBox}>
					<img src="/logo.png" alt="Leikapui" className={css.logoImage} />
					<span className={css.logoText}>Leikapui Studios</span>
				</div>

				<div className={css.menuList}>
					{visibleItems.map((item, idx) => {
						if (item.id === "profile" || item.id === "auth") return null;
						const isActive = panelIndex === item.panelIndex && !item.action;
						return (
							<SpottableItem
								key={item.id}
								spotlightId={`sidebar-item-${idx}`}
								data-spotlight-id={`sidebar-item-${idx}`}
								className={`${css.menuItem} ${isActive ? css.active : ""}`}
								onClick={() => handleItemClick(idx)}
								onFocus={handleItemFocus}
								onSpotlightDown={(ev) => handleSpotlightDown(idx, ev)}
								onSpotlightUp={(ev) => handleSpotlightUp(idx, ev)}
								onSpotlightRight={handleSpotlightRight}
								tabIndex={0}
							>
								<div className={css.activeIndicator} />
								<div className={css.iconWrapper}>{item.icon}</div>
								<span className={css.label}>{item.label}</span>
							</SpottableItem>
						);
					})}
				</div>
			</div>

			<div className={css.bottomSection}>
				{visibleItems.map((item, idx) => {
					if (item.id !== "profile" && item.id !== "auth") return null;
					const isActive = panelIndex === item.panelIndex && !item.action;
					return (
						<SpottableItem
							key={item.id}
							spotlightId={`sidebar-item-${idx}`}
							data-spotlight-id={`sidebar-item-${idx}`}
							className={`${css.menuItem} ${isActive ? css.active : ""}`}
							onClick={() => handleItemClick(idx)}
							onFocus={handleItemFocus}
							onSpotlightDown={(ev) => handleSpotlightDown(idx, ev)}
							onSpotlightUp={(ev) => handleSpotlightUp(idx, ev)}
							onSpotlightRight={handleSpotlightRight}
							tabIndex={0}
						>
							<div className={css.activeIndicator} />
							<div className={css.iconWrapper}>{item.icon}</div>
							<span className={css.label}>{item.label}</span>
						</SpottableItem>
					);
				})}
			</div>
		</nav>
	);
};

const SidebarDecorator = SpotlightContainerDecorator({
	enterTo: "default-element",
	defaultElement: '[data-spotlight-id="sidebar-item-0"]',
	preserveId: true,
	continue5WayHold: true,
});

export default SidebarDecorator(Sidebar);
