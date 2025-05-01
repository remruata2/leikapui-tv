import { useState, useEffect } from "react";
import { Cell, Row } from "@enact/ui/Layout";
import Scroller from "@enact/sandstone/Scroller";
import Icon from "@enact/sandstone/Icon";
import BodyText from "@enact/sandstone/BodyText";
import Popup from "@enact/sandstone/Popup";
import { StorageService } from "../../utils/storage";
import css from "./Profile.module.less";
import { FaUser, FaEnvelope, FaPhone, FaCalendarAlt } from "react-icons/fa";
import deviceInfo from "@enact/webos/deviceinfo";

const Profile = ({ isLoggedIn, setPanelIndex }) => {
	const [profile, setProfile] = useState(null);
	const [editMode, setEditMode] = useState(false);
	const [editedProfile, setEditedProfile] = useState({});
	const [showSuccessPopup, setShowSuccessPopup] = useState(false);
	const [showErrorPopup, setShowErrorPopup] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	// Helper function to format date with validation
	const formatDate = (dateString) => {
		if (!dateString) return "Not available";

		const date = new Date(dateString);

		// Check if date is valid
		if (isNaN(date.getTime())) {
			return "Not available";
		}

		return date.toLocaleDateString(undefined, {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	// Function to check the SDK version
	const checkSdkVersion = () => {
		deviceInfo((info) => {
			if (info && info.sdkVersion) {
				console.log("webOS SDK Version:", info.sdkVersion);
			} else {
				console.log("SDK version not available or device info failed:", info);
			}
		});
	};

	// Call the function
	checkSdkVersion();
	const loadUserProfile = async () => {
		try {
			const authData = StorageService.getItem("authData");
			console.log("Auth Data", authData);

			if (!authData || !authData.user) {
				console.error("No auth data found");
				// Instead of error popup, set a fallback profile
				setProfile({
					username: "Guest User",
					email: "Please log in to view your profile",
					phone: "",
					createdAt: new Date().toISOString(),
				});
				setEditedProfile({
					username: "Guest User",
					email: "Please log in to view your profile",
					phone: "",
				});
				return;
			}

			// If we have valid auth data, use it directly or fetch from API
			if (authData.user.role === "tester" || !authData.user._id) {
				setProfile({
					username: authData.user.username || "Tester",
					email: authData.user.email || "tester@leikapui.com",
					phone: authData.user.phone || "1234567890",
					createdAt: authData.user.createdAt || new Date().toISOString(),
				});
				setEditedProfile({
					username: authData.user.username || "Tester",
					email: authData.user.email || "tester@leikapui.com",
					phone: authData.user.phone || "1234567890",
				});
			} else {
				// Try to fetch from API
				try {
					console.log(
						"Fetching profile from API for user ID:",
						authData.user._id
					);
					const response = await fetch(
						`${process.env.REACT_APP_API_URL}/api/users/tvProfile/${authData.user._id}`,
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
						throw new Error(
							`Failed to load profile from API: ${response.status}`
						);
					}

					const userData = await response.json();
					console.log("API user data received:", userData);

					// Ensure createdAt is present or use a fallback
					const userDataWithDefaults = {
						...userData,
						createdAt:
							userData.createdAt ||
							authData.user.createdAt ||
							new Date().toISOString(),
					};

					setProfile(userDataWithDefaults);
					setEditedProfile(userDataWithDefaults);
					console.log("Profile set with data:", userDataWithDefaults);
				} catch (apiError) {
					console.error(
						"API error, falling back to stored user data:",
						apiError
					);
					// Fallback to using the auth data directly
					const fallbackProfile = {
						...authData.user,
						createdAt: authData.user.createdAt || new Date().toISOString(),
					};
					console.log("Using fallback profile:", fallbackProfile);
					setProfile(fallbackProfile);
					setEditedProfile(fallbackProfile);
				}
			}
		} catch (error) {
			console.error("Error loading profile:", error);
			setErrorMessage("Failed to load profile");
			setShowErrorPopup(true);
		}
	};

	console.log("User data:", profile);

	useEffect(() => {
		// We're already inside the Profile component, so we don't need to redirect
		// Instead, just try to load the profile with fallback data if auth fails
		const loadProfileData = async () => {
			try {
				const authData = StorageService.getItem("authData");
				console.log(
					"Profile: Auth data from storage:",
					authData ? "Found" : "Not found"
				);

				// Check if we have auth data for API call
				if (authData && authData.user) {
					// Always get fresh data from the API
					await loadUserProfile();
					return;
				}

				// If no auth data, use fallback profile
				console.log("Profile: No auth data, using fallback profile");
				setProfile({
					username: "Guest User",
					email: "Please log in to view your profile",
					phone: "",
					createdAt: new Date().toISOString(),
				});
				setEditedProfile({
					username: "Guest User",
					email: "Please log in to view your profile",
					phone: "",
				});
			} catch (error) {
				console.error("Profile: Error loading profile:", error);
				// Set a fallback profile with an error message
				setProfile({
					username: "Guest User",
					email: "Please log in to view your profile",
					phone: "",
					createdAt: new Date().toISOString(),
				});
				setEditedProfile({
					username: "Guest User",
					email: "Please log in to view your profile",
					phone: "",
				});
			}
		};

		loadProfileData();
	}, [isLoggedIn]);

	const validateProfileData = (data) => {
		if (data.phone && !/^\d{10}$/.test(data.phone)) {
			setErrorMessage("Phone number must be 10 digits");
			setShowErrorPopup(true);
			return false;
		}
		return true;
	};

	const handleSave = async () => {
		if (!validateProfileData(editedProfile)) return;

		try {
			const deviceCode = StorageService.getItem("deviceCode");
			if (!deviceCode) {
				setErrorMessage("Authentication required");
				setShowErrorPopup(true);
				return;
			}

			const response = await fetch(
				`${process.env.REACT_APP_API_URL}/api/users/tvProfile`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						deviceCode,
						updates: editedProfile,
					}),
					credentials: "include",
				}
			);

			if (!response.ok) {
				throw new Error("Failed to update profile");
			}

			const updatedProfile = await response.json();
			setProfile(updatedProfile);
			setEditMode(false);
			setShowSuccessPopup(true);
		} catch (error) {
			console.error("Error updating profile:", error);
			setErrorMessage("Failed to update profile");
			setShowErrorPopup(true);
		}
	};

	const handleInputChange = (name, value) => {
		setEditedProfile((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	if (!profile) {
		return (
			<div className={css.loadingContainer}>
				<Icon>loading</Icon>
				<BodyText>Loading profile...</BodyText>
			</div>
		);
	}

	return (
		<Scroller className={css.profileScroller}>
			<div className={css.profileContainer}>
				<div className={css.profileHeader}>
					<div className={css.profileAvatar}>
						<FaUser size={60} color="#fff" />
					</div>
					<h1 className={css.profileName}>{profile.username || "User"}</h1>
				</div>

				<div className={css.profileDetails}>
					<div className={css.profileItem}>
						<FaEnvelope className={css.profileIcon} />
						<div className={css.profileInfo}>
							<label>Email</label>
							<span>{profile.email || "Not provided"}</span>
						</div>
					</div>

					<div className={css.profileItem}>
						<FaPhone className={css.profileIcon} />
						<div className={css.profileInfo}>
							<label>Phone</label>
							<span>{profile.phone || "Not provided"}</span>
						</div>
					</div>

					<div className={css.profileItem}>
						<FaCalendarAlt className={css.profileIcon} />
						<div className={css.profileInfo}>
							<label>Member Since</label>
							<span>{formatDate(profile.createdAt)}</span>
						</div>
					</div>

					{profile.purchasedMovies && profile.purchasedMovies.length > 0 && (
						<Row className={css.detailRow}>
							<Cell size="40%">
								<BodyText>Purchased Movies:</BodyText>
							</Cell>
							<Cell>
								<BodyText>{profile.purchasedMovies.length} movies</BodyText>
							</Cell>
						</Row>
					)}
				</div>
			</div>

			<Popup
				open={showSuccessPopup}
				onClose={() => setShowSuccessPopup(false)}
				showCloseButton
			>
				Profile updated successfully!
			</Popup>

			<Popup
				open={showErrorPopup}
				onClose={() => setShowErrorPopup(false)}
				showCloseButton
			>
				{errorMessage || "An error occurred"}
			</Popup>
		</Scroller>
	);
};

export default Profile;
