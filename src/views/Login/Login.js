import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import css from "./Login.module.less";
import { useState, useEffect } from "react";
import Item from "@enact/sandstone/Item";
import Button from "@enact/sandstone/Button";

const Login = () => {
  const navigate = useNavigate();
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [loginStatus, setLoginStatus] = useState("waiting");
  const [selectedMethod, setSelectedMethod] = useState("qr"); // 'qr' or 'google'
  const [focusedItem, setFocusedItem] = useState("qr");

  useEffect(() => {
    const fetchDeviceCode = async () => {
      try {
        setLoginStatus("generating");
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/auth/device-code`,
          {
            method: "POST",
          }
        );
        const data = await response.json();
        console.log("Device Code Response:", data);
        setQrCodeUrl(data.verification_url);
        setLoginStatus("waiting");

        // Polling for authentication
        const pollInterval = setInterval(async () => {
          const pollResponse = await fetch(
            `${process.env.REACT_APP_API_URL}/auth/poll`,
            {
              method: "POST",
              body: JSON.stringify({ device_code: data.device_code }),
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          const pollData = await pollResponse.json();
          if (pollData.authenticated) {
            setLoginStatus("success");
            clearInterval(pollInterval);
            setTimeout(() => navigate("/home"), 1500); // Give time to show success message
          }
        }, 5000);

        return () => clearInterval(pollInterval);
      } catch (error) {
        console.error("Error during login:", error);
        setLoginStatus("error");
      }
    };

    if (selectedMethod === "qr") {
      fetchDeviceCode();
    }
  }, [navigate, selectedMethod]);

  const handleKeyDown = (e) => {
    if (e.keyCode === 37 || e.keyCode === 39) {
      // Left/Right arrows
      setFocusedItem(focusedItem === "qr" ? "google" : "qr");
    } else if (e.keyCode === 13) {
      // Enter key
      setSelectedMethod(focusedItem);
    }
  };

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

  const handleGoogleLogin = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/auth/google-tv`,
        {
          method: "POST",
        }
      );
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
            <h2>Sign in with Google</h2>
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
