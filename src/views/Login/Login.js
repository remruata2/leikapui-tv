import { useNavigate } from "react-router-dom";
import { Button } from "@enact/sandstone/Button";
import QRCode from "qrcode.react";
import css from "./Login.module.less";
import { useState, useEffect } from "react";

const Login = () => {
  const navigate = useNavigate();
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  useEffect(() => {
    const fetchDeviceCode = async () => {
      try {
        const response = await fetch("http://localhost:4000/auth/device-code", {
          method: "POST",
        });
        const data = await response.json();
        setQrCodeUrl(data.verification_url);

        // Polling for authentication
        const pollInterval = setInterval(async () => {
          const pollResponse = await fetch("http://localhost:4000/auth/poll", {
            method: "POST",
            body: JSON.stringify({ device_code: data.device_code }),
            headers: {
              "Content-Type": "application/json",
            },
          });
          const pollData = await pollResponse.json();
          if (pollData.authenticated) {
            clearInterval(pollInterval);
            navigate("/home");
          }
        }, 5000);
      } catch (error) {
        console.error("Error during Google login:", error);
      }
    };

    fetchDeviceCode();
  }, [navigate]);

  return (
    <div className={css.login}>
      <div className={css.siteInfo}>
        <h1>Leikapui Studios Tv</h1>
      </div>
      <div className={css.loginForm}>
        {qrCodeUrl ? <QRCode value={qrCodeUrl} /> : <p>Loading QR Code...</p>}
      </div>
    </div>
  );
};

export default Login;
