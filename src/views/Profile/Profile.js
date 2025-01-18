import { useState, useEffect } from "react";
import Input from "@enact/sandstone/Input";
import Button from "@enact/sandstone/Button";
import { Cell, Row } from "@enact/ui/Layout";
import css from "./Profile.module.less";
import Popup from "@enact/sandstone/Popup";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [editedProfile, setEditedProfile] = useState({});
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      // Check if user is authenticated
      const authResponse = await fetch(`${process.env.REACT_APP_API_URL}/auth/is-authenticated`, {
        credentials: "include", // This will send cookies automatically
      });
      
      if (!authResponse.ok) {
        console.error("Authentication failed");
        setShowErrorPopup(true);
        return;
      }

      const authData = await authResponse.json();
      
      if (!authData.isAuthenticated || !authData.user) {
        console.error("User not authenticated");
        setShowErrorPopup(true);
        return;
      }

      setProfile(authData.user);
      setEditedProfile(authData.user);
    } catch (error) {
      console.error("Error loading profile:", error);
      setShowErrorPopup(true);
    }
  };

  const validateProfileData = (data) => {
    if (data.phone && !/^\d{10}$/.test(data.phone)) {
      setShowErrorPopup(true);
      return false;
    }
    return true;
  };

  const handleUpdateProfile = async () => {
    try {
      if (!validateProfileData(editedProfile)) {
        return;
      }

      if (!profile?._id) {
        console.error("No user ID available for update");
        setShowErrorPopup(true);
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/users/${profile._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // This will send cookies automatically
          body: JSON.stringify({
            full_name: editedProfile.full_name,
            phone: editedProfile.phone
          }),
        }
      );

      if (response.ok) {
        await loadUserProfile();
        setShowSuccessPopup(true);
      } else {
        const errorData = await response.json();
        console.error("Profile update failed:", errorData);
        setShowErrorPopup(true);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setShowErrorPopup(true);
    }
  };

  const handleInputChange = (name) => (event) => {
    setEditedProfile((prev) => ({
      ...prev,
      [name]: event.value,
    }));
  };

  if (!profile) {
    return (
      <Cell>
        <div className={css.loadingContainer}>Loading...</div>
      </Cell>
    );
  }

  return (
    <Cell className={css.profileContainer}>
      <Row className={css.header}>
        <h1>Profile Settings</h1>
      </Row>

      <Row className={css.formGroup}>
        <Cell size="40%">
          <Input
            className={css.input}
            placeholder="Full Name"
            value={editedProfile.full_name || ""}
            onChange={handleInputChange("full_name")}
          />
        </Cell>
      </Row>

      <Row className={css.formGroup}>
        <Cell size="40%">
          <Input
            className={css.input}
            placeholder="Phone Number"
            value={editedProfile.phone || ""}
            onChange={handleInputChange("phone")}
          />
        </Cell>
      </Row>

      <Row className={css.formGroup}>
        <Cell shrink>
          <Button
            className={css.updateButton}
            onClick={handleUpdateProfile}
            size="large"
          >
            Update Profile
          </Button>
        </Cell>
      </Row>

      <Popup
        open={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
      >
        {"Profile updated successfully"}
      </Popup>

      <Popup
        open={showErrorPopup}
        onClose={() => setShowErrorPopup(false)}
      >
        {"There was an error updating your profile. Please try again."}
      </Popup>
    </Cell>
  );
};

export default Profile;
