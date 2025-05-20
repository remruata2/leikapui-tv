import { QRCodeCanvas } from "qrcode.react";
import css from "./Login.module.less";
import { useState, useEffect } from "react";
import { StorageService } from "../../utils/storage";
import Button from "@enact/sandstone/Button";
import Input from "@enact/sandstone/Input";
import Item from "@enact/sandstone/Item";
import Popup from "@enact/sandstone/Popup";
import { FaUserCircle, FaBackspace } from "react-icons/fa";

const Login = ({ setPanelIndex, setIsLoggedIn }) => {
	const [qrCodeUrl, setQrCodeUrl] = useState("");
	const [loginStatus, setLoginStatus] = useState("waiting");
	const [selectedMethod, setSelectedMethod] = useState("qr");
	const [focusedItem, setFocusedItem] = useState("qr");
	const [reviewerPin, setReviewerPin] = useState("");
	const [reviewerError, setReviewerError] = useState("");
	const [showPinPad, setShowPinPad] = useState(false);

	const API_URL = process.env.REACT_APP_API_URL;
	const TEST_TOKEN = process.env.REACT_APP_TEST_TOKEN;

	const logo = require("../../assets/icon-darkbg.png");

	const getStatusMessage = () => {
		switch (loginStatus) {
			case "generating":
				return "Generating QR code...";
			case "waiting":
				return "Open your mobile app->Open Menu->Go to Tv Login->Scan this code";
			case "success":
				return "Login successful! Redirecting...";
			case "error":
				return "Error occurred. Please try again.";
			case "device_limit":
				return "Maximum number of devices (5) reached. Please remove an existing device from your account and try again.";
			default:
				return "";
		}
	};

	const saveAuthData = (token, user) => {
		try {
			// Store in localStorage
			StorageService.setItem("authData", { token, user });
			console.log("[TV Login] Auth data saved successfully");

			// Register device and check if successful
			registerDevice(token).then((success) => {
				if (success) {
					// Set success status and navigate
					setLoginStatus("success");
					console.log("[TV Login] Redirecting to home panel");
					setPanelIndex(0);
				} else if (loginStatus !== "device_limit") {
					// Only set error if it's not already set to device_limit
					setLoginStatus("error");
					// Don't redirect if we hit device limit
					if (loginStatus !== "device_limit") {
						setPanelIndex(0);
					}
				}
			});
		} catch (error) {
			console.error("[TV Login] Failed to save auth data:", error);
			setLoginStatus("error");
			// Still redirect even if storage fails
			setPanelIndex(0);
		}
	};

	const registerDevice = async (token) => {
		try {
			// Generate a UUID using a simple function since crypto might not be available
			const generateUUID = () => {
				return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
					/[xy]/g,
					function (c) {
						const r = (Math.random() * 16) | 0;
						const v = c === "x" ? r : (r & 0x3) | 0x8;
						return v.toString(16);
					}
				);
			};

			// Check if we already have a device ID stored
			let deviceId = StorageService.getItem("deviceId");

			// If no device ID stored, generate a new one
			if (!deviceId) {
				deviceId = generateUUID();
				console.log("[TV Login] Generated new device ID:", deviceId);
			} else {
				console.log("[TV Login] Using existing device ID:", deviceId);
			}

			const deviceInfo = {
				deviceId: deviceId,
				deviceBrand: "LG",
				modelName: "WebOS TV",
				platform: "webos",
				osVersion: "unknown",
				isDevice: true,
				deviceType: "tv",
				userAgent: window.navigator?.userAgent || "WebOS TV",
				language: window.navigator?.language || "en",
			};

			// First, try to get existing devices to check if this device is already registered
			const checkResponse = await fetch(`${API_URL}/api/devices`, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (checkResponse.ok) {
				const devices = await checkResponse.json();
				const existingDevice = devices.find((d) => d.deviceId === deviceId);

				if (existingDevice) {
					console.log(
						"[TV Login] Device already registered, updating last used time"
					);
					// Update the device's last used time
					const updateResponse = await fetch(
						`${API_URL}/api/devices/${deviceId}`,
						{
							method: "PUT",
							headers: {
								"Content-Type": "application/json",
								Authorization: `Bearer ${token}`,
							},
							body: JSON.stringify({ online: true }),
						}
					);

					if (updateResponse.ok) {
						console.log("[TV Login] Device status updated successfully");
						return true;
					}
				}
			}

			// If we reach here, either the device doesn't exist or we failed to update it
			// Register the device
			const response = await fetch(`${API_URL}/api/devices`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(deviceInfo),
			});

			const responseData = await response.json();

			if (!response.ok) {
				// Check if the error is due to device limit
				if (
					response.status === 400 &&
					responseData.message &&
					responseData.message.includes("Maximum number of devices")
				) {
					console.error(
						"[TV Login] Device limit reached:",
						responseData.message
					);
					setLoginStatus("device_limit");
					return false;
				}
				throw new Error(`Failed to register device: ${response.status}`);
			}

			console.log("[TV Login] Device registered successfully:", responseData);

			// Store device ID for future reference
			StorageService.setItem("deviceId", deviceId);
			return true;
		} catch (error) {
			console.error("[TV Login] Failed to register device:", error);
			// Return false to indicate failure
			return false;
		}
	};

	const handleTestLogin = async () => {
		try {
			const response = await fetch(`${API_URL}/auth/test-login`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					token: TEST_TOKEN,
				}),
			});
			console.log("API URL:", API_URL);
			console.log("Token Env:", process.env.REACT_APP_TEST_TOKEN);
			const data = await response.json();

			if (response.ok) {
				window.localStorage.setItem("token", data.token);
				setIsLoggedIn(true);
				saveAuthData(data.token, data.user);
			} else {
				console.error("Test login failed:", data.message);
			}
		} catch (error) {
			console.error("Error during test login:", error);
		}
	};

	// Reviewer login function that validates the PIN code
	const handleReviewerLogin = async () => {
		// Reset any previous error
		setReviewerError("");

		// First validate the PIN (security check)
		const correctPin = process.env.REACT_APP_REVIEWER_PIN || "123456";
		if (reviewerPin !== correctPin) {
			console.error("[TV Login] Invalid reviewer PIN");
			setReviewerError("Invalid access code. Please try again.");
			return;
		}

		try {
			// If PIN is correct, authenticate as tester user
			const response = await fetch(`${API_URL}/auth/login`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: "tester@leikapui.com",
					password: process.env.REACT_APP_TESTER_PASSWORD,
				}),
			});

			const data = await response.json();

			if (response.ok) {
				console.log("[TV Login] Reviewer authenticated as tester user");
				window.localStorage.setItem("token", data.token);
				setIsLoggedIn(true);
				saveAuthData(data.token, data.user);
			} else {
				console.error("[TV Login] Failed to authenticate tester user");
				setReviewerError(data.message || "Authentication failed");
			}
		} catch (error) {
			console.error("[TV Login] Error during reviewer login:", error);
			setReviewerError("Login service unavailable");
		}
	};

	useEffect(() => {
		let pollInterval;

		const fetchDeviceCode = async () => {
			try {
				// Check if already authenticated
				const storedAuth = StorageService.getItem("authData");
				if (storedAuth) {
					console.log("[TV Login] Found existing auth data, redirecting");
					setIsLoggedIn(true);
					setPanelIndex(0); // Go to home panel
					return;
				}

				setLoginStatus("generating");
				const response = await fetch(`${API_URL}/auth/device-code`, {
					method: "POST",
				});
				const data = await response.json();
				console.log("[TV Login] Device Code Response:", data);

				const qrUrl = `leikapui://verify/${data.user_code}`;
				setQrCodeUrl(qrUrl);
				setLoginStatus("waiting");

				pollInterval = setInterval(async () => {
					try {
						console.log("[TV Login] Polling for authentication...");
						const pollResponse = await fetch(`${API_URL}/auth/poll`, {
							method: "POST",
							body: JSON.stringify({ device_code: data.user_code }),
							headers: {
								"Content-Type": "application/json",
							},
						});

						if (!pollResponse.ok) {
							throw new Error(`Poll request failed: ${pollResponse.status}`);
						}

						const pollData = await pollResponse.json();
						console.log("[TV Login] Poll response:", pollData);

						if (pollData.authenticated) {
							console.log("[TV Login] Authentication successful");
							clearInterval(pollInterval);
							setIsLoggedIn(true);
							saveAuthData(pollData.token, pollData.user);
						}
					} catch (error) {
						console.error("[TV Login] Error during polling:", error);
						setLoginStatus("error");
						clearInterval(pollInterval);
					}
				}, 5000);
			} catch (error) {
				console.error("[TV Login] Error during device code fetch:", error);
				setLoginStatus("error");
			}
		};

		// Only start device code flow if we're on the login panel
		if (selectedMethod === "qr") {
			fetchDeviceCode();
		}

		return () => {
			if (pollInterval) {
				console.log("[TV Login] Cleaning up poll interval");
				clearInterval(pollInterval);
			}
		};
	}, [setPanelIndex, selectedMethod, setIsLoggedIn]);

	const handleKeyDown = (e) => {
		if (e.keyCode === 37 || e.keyCode === 39) {
			// Left/Right arrows
			setFocusedItem(focusedItem === "qr" ? "google" : "qr");
		} else if (e.keyCode === 13) {
			// Enter key
			setSelectedMethod(focusedItem);
		} else if (e.altKey && e.ctrlKey && e.keyCode === 82) {
			// Alt+Ctrl+R
			// Special key combination for reviewer access - directly open PIN popup
			setShowPinPad(true);
		}
	};

	return (
		<div className={css.login} onKeyDown={handleKeyDown}>
			<div className={css.siteInfo}>
				<div className={css.logoTextContainer}>
					<img
						src={logo}
						alt="Leikapui Studios TV"
						width="400px"
						height="400px"
					/>
					<p>Your Entertainment Hub</p>
				</div>
			</div>
			<div className={css.loginForm}>
				<div className={css.loginOptions}>
					<div className={css.option}>
						<h2>Quick Login with Mobile</h2>
						<div className={css.qrContainer}>
							{qrCodeUrl ? (
								<QRCodeCanvas
									value={qrCodeUrl}
									size={180}
									level="H"
									includeMargin={true}
									style={{
										padding: "0.8rem",
										background: "white",
										borderRadius: "8px",
									}}
								/>
							) : (
								<div className={css.loading}>Loading QR Code...</div>
							)}
							<p className={css.status}>{getStatusMessage()}</p>
						</div>
					</div>

					{/* Reviewer access button at the bottom */}
					<div className={css.reviewerAccess}>
						<Button
							className={css.reviewerButton}
							onClick={() => {
								setShowPinPad(true);
								setReviewerError("");
							}}
							data-spotlight-id="show-reviewer-input"
						>
							<FaUserCircle className={css.buttonIcon} />
							<span className={css.buttonText}>Reviewer Login</span>
						</Button>
					</div>

					{/* Use Enact's Popup for proper sizing and positioning */}
					<Popup
						open={showPinPad}
						noAnimation={false}
						onClose={() => {
							setShowPinPad(false);
							setReviewerPin("");
							setReviewerError("");
						}}
						className={css.pinPopup}
					>
						<div className={css.pinPopupContent}>
							<Input
								type="password"
								placeholder="Enter Access code"
								value={reviewerPin}
								onChange={(e) => setReviewerPin(e.value)}
								size="small"
								autoFocus
								onKeyUp={(e) => {
									if (e.keyCode === 13) {
										// Enter key
										const correctPin =
											process.env.REACT_APP_REVIEWER_PIN || "123456";
										if (reviewerPin === correctPin) {
											handleTestLogin();
											setShowPinPad(false);
											setReviewerPin("");
										} else {
											setReviewerError("Invalid access code");
											setReviewerPin("");
										}
									} else if (e.keyCode === 27) {
										// Escape key
										setShowPinPad(false);
										setReviewerPin("");
										setReviewerError("");
									}
								}}
							/>

							<div className={css.pinActions}>
								<Button
									size="small"
									onClick={() => {
										setShowPinPad(false);
										setReviewerPin("");
										setReviewerError("");
									}}
								>
									Cancel
								</Button>
								<Button
									size="small"
									backgroundOpacity="opaque"
									color="green"
									onClick={() => {
										const correctPin =
											process.env.REACT_APP_REVIEWER_PIN || "123456";
										if (reviewerPin === correctPin) {
											handleTestLogin();
											setShowPinPad(false);
											setReviewerPin("");
										} else {
											setReviewerError("Invalid access code");
											setReviewerPin("");
										}
									}}
									data-spotlight-id="pin-submit-button"
								>
									Submit
								</Button>
							</div>

							{reviewerError && (
								<p className={css.reviewerError}>{reviewerError}</p>
							)}
						</div>
					</Popup>
				</div>
			</div>
		</div>
	);
};

export default Login;
