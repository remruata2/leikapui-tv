import { QRCodeCanvas } from "qrcode.react";
import css from "./Login.module.less";
import { useState, useEffect } from "react";
import Item from "@enact/sandstone/Item";
import Button from "@enact/sandstone/Button";
import { StorageService } from "../../utils/storage";

const Login = ({ setPanelIndex }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [loginStatus, setLoginStatus] = useState("waiting");
  const [selectedMethod, setSelectedMethod] = useState("qr");
  const [focusedItem, setFocusedItem] = useState("qr");

  const API_URL = process.env.REACT_APP_API_URL;

  const getStatusMessage = () => {
    switch (loginStatus) {
      case "generating":
        return "Generating QR code...";
      case "waiting":
        return "Open your mobile app and scan this code";
      case "success":
        return "Login successful! Redirecting...";
      case "error":
        return "Error occurred. Please try again.";
      default:
        return "";
    }
  };

  const saveAuthData = (token, user) => {
    try {
      // Store in localStorage
      StorageService.setItem("authData", { token, user });
      console.log("[TV Login] Auth data saved successfully");

      // Register device
      registerDevice(token);

      // Set success status and navigate
      setLoginStatus("success");
      console.log("[TV Login] Redirecting to home panel");
      setPanelIndex(0);
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

      const deviceInfo = {
        deviceId: generateUUID(),
        deviceBrand: "LG",
        modelName: "WebOS TV",
        platform: "webos",
        osVersion: "unknown",
        isDevice: true,
        deviceType: "tv",
        userAgent: window.navigator?.userAgent || "WebOS TV",
        language: window.navigator?.language || "en",
      };

      const response = await fetch(`${API_URL}/api/devices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(deviceInfo),
      });

      if (!response.ok) {
        throw new Error(`Failed to register device: ${response.status}`);
      }

      const savedDevice = await response.json();
      console.log("[TV Login] Device registered successfully:", savedDevice);

      // Store device ID for future reference
      StorageService.setItem("deviceId", deviceInfo.deviceId);
    } catch (error) {
      console.error("[TV Login] Failed to register device:", error);
      // Non-blocking error - don't prevent login completion
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
  }, [setPanelIndex, selectedMethod]);

  const handleKeyDown = (e) => {
    if (e.keyCode === 37 || e.keyCode === 39) {
      // Left/Right arrows
      setFocusedItem(focusedItem === "qr" ? "google" : "qr");
    } else if (e.keyCode === 13) {
      // Enter key
      setSelectedMethod(focusedItem);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/google-tv`, {
        method: "POST",
      });
      const data = await response.json();
      window.location.href = data.authUrl;
    } catch (error) {
      console.error("Error initiating Google login:", error);
    }
  };

  return (
    <div className={css.login} onKeyDown={handleKeyDown}>
      <div className={css.siteInfo}>
        <h1>Leikapui Studios TV</h1>
        <p>Your Entertainment Hub</p>
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

          <div className={css.divider}>
            <span>or</span>
          </div>

          <Item
            className={`${css.option} ${
              focusedItem === "google" ? css.focused : ""
            } ${selectedMethod === "google" ? css.selected : ""}`}
            onClick={() => setSelectedMethod("google")}
            onFocus={() => setFocusedItem("google")}
            spotlightId="google-option"
          >
            <h2>Login with Google</h2>
            {selectedMethod === "google" && (
              <div className={css.googleContainer}>
                <Button
                  onClick={handleGoogleLogin}
                  className={css.googleButton}
                  size="large"
                >
                  Continue with Google
                </Button>
              </div>
            )}
          </Item>
        </div>
      </div>
    </div>
  );
};

export default Login;
