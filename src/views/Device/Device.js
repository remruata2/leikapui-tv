import { useEffect, useState } from "react";
import {
	FaDesktop,
	FaMobileAlt,
	FaTabletAlt,
	FaMicrochip,
	FaClock,
} from "react-icons/fa";
import { StorageService } from "../../utils/storage";
import css from "./Device.module.less";

const Device = () => {
	const [devices, setDevices] = useState([]);
	const [errorMessage, setErrorMessage] = useState("");
	const [showErrorPopup, setShowErrorPopup] = useState(false);

	const loadDevices = async () => {
		try {
			const authData = StorageService.getItem("authData");

			if (!authData || !authData.user || !authData.user.id) {
				console.error("No auth data found");
				setErrorMessage("Authentication required");
				setShowErrorPopup(true);
				return;
			}

			const response = await fetch(
				`${process.env.REACT_APP_API_URL}/api/devices`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${authData.token}`,
					},
					credentials: "include",
				}
			);

			if (!response.ok) {
				throw new Error("Failed to load devices");
			}

			const deviceData = await response.json();
			setDevices(deviceData);
		} catch (error) {
			console.error("Error loading devices:", error);
			setErrorMessage("Failed to load device information");
			setShowErrorPopup(true);
		}
	};

	useEffect(() => {
		loadDevices();
	}, []);

	const getDeviceIcon = (deviceType) => {
		switch (deviceType?.toLowerCase()) {
			case "mobile":
				return <FaMobileAlt />;
			case "tablet":
				return <FaTabletAlt />;
			default:
				return <FaDesktop />;
		}
	};

	if (devices.length === 0) {
		return (
			<div className={css.deviceLoading}>
				<div className={css.loadingSpinner} />
				<p>Loading devices...</p>
			</div>
		);
	}

	return (
		<div className={css.deviceContainer}>
			<div className={css.deviceHeader}>
				<h1 className={css.deviceTitle}>Your Devices</h1>
				<div className={css.deviceCount}>
					{devices.length} {devices.length === 1 ? "Device" : "Devices"}
				</div>
			</div>

			<div className={css.deviceGrid}>
				{devices.map((device) => (
					<div key={device.deviceId} className={css.deviceCard}>
						<div className={css.deviceCardHeader}>
							<div className={css.deviceIcon}>
								{getDeviceIcon(device.deviceType)}
							</div>
							<div className={css.onlineStatus} data-online={device.online}>
								{device.online ? "Online" : "Offline"}
							</div>
						</div>

						<p className={css.deviceName}>
							{device.deviceBrand} {device.modelName}
						</p>

						<div className={css.deviceDetails}>
							<div className={css.deviceItem}>
								<FaMicrochip className={css.itemIcon} />
								<div className={css.itemInfo}>
									<label>Platform</label>
									<span>
										{device.platform} {device.osVersion}
									</span>
								</div>
							</div>

							<div className={css.deviceItem}>
								<FaClock className={css.itemIcon} />
								<div className={css.itemInfo}>
									<label>Last Used</label>
									<span>
										{new Date(device.lastUsedAt).toLocaleDateString()}
									</span>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>

			{showErrorPopup && (
				<div className={css.errorPopup}>
					<p>{errorMessage}</p>
					<button onClick={() => setShowErrorPopup(false)}>Close</button>
				</div>
			)}
		</div>
	);
};

export default Device;
