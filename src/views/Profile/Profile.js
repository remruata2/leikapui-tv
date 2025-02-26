import { useState, useEffect } from "react";
import Input from "@enact/sandstone/Input";
import { Cell, Row } from "@enact/ui/Layout";
import Scroller from "@enact/sandstone/Scroller";
import Icon from "@enact/sandstone/Icon";
import BodyText from "@enact/sandstone/BodyText";
import Popup from "@enact/sandstone/Popup";
import { StorageService } from "../../utils/storage";
import css from "./Profile.module.less";
import { FaUser, FaEnvelope, FaPhone, FaCalendarAlt } from "react-icons/fa";

const Profile = ({ isLoggedIn, setPanelIndex }) => {
	const [profile, setProfile] = useState(null);
	const [editMode, setEditMode] = useState(false);
	const [editedProfile, setEditedProfile] = useState({});
	const [showSuccessPopup, setShowSuccessPopup] = useState(false);
	const [showErrorPopup, setShowErrorPopup] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const loadUserProfile = async () => {
		try {
			const authData = StorageService.getItem("authData");
			console.log(authData);

			if (!authData || !authData.user || !authData.user.id) {
				console.error("No auth data found");
				setErrorMessage("Authentication required");
				setShowErrorPopup(true);
				return;
			}

			const response = await fetch(
				`${process.env.REACT_APP_API_URL}/api/users/tvProfile/${authData.user.id}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
					credentials: "include",
				}
			);

			if (!response.ok) {
				throw new Error("Failed to load profile");
			}

			const userData = await response.json();
			setProfile(userData);
			setEditedProfile(userData);
		} catch (error) {
			console.error("Error loading profile:", error);
			setErrorMessage("Failed to load profile");
			setShowErrorPopup(true);
		}
	};

	useEffect(() => {
		if (!isLoggedIn) {
			setPanelIndex(6); // Redirect to login
			return;
		}
		loadUserProfile();
	}, [isLoggedIn, setPanelIndex]);

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
							<span>{new Date(profile.createdAt).toLocaleDateString()}</span>
						</div>
					</div>

					<Row className={css.detailRow}>
						<Cell size="40%">
							<BodyText>Username:</BodyText>
						</Cell>
						<Cell>
							{editMode ? (
								<Input
									value={editedProfile.username}
									onChange={(e) => handleInputChange("username", e.value)}
								/>
							) : (
								<BodyText>{profile.username}</BodyText>
							)}
						</Cell>
					</Row>

					<Row className={css.detailRow}>
						<Cell size="40%">
							<BodyText>Phone:</BodyText>
						</Cell>
						<Cell>
							{editMode ? (
								<Input
									value={editedProfile.phone || ""}
									onChange={(e) => handleInputChange("phone", e.value)}
									type="tel"
								/>
							) : (
								<BodyText>{profile.phone || "Not provided"}</BodyText>
							)}
						</Cell>
					</Row>

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
