import { useState } from "react";
import "./Login.css";
import axios from "axios";
import { BASE_URI } from "../../network/baseurl";
import { useSearchParams } from "react-router-dom";

const Login = () => {
  const [searchParams] = useSearchParams();
  const [showModal, setShowModal] = useState(false);
  const userId = searchParams.get("userId");
  const redirectUrl = searchParams.get("redirectUrl");
  const [formData, setFormData] = useState({
    smtp_host: "",
    smtp_port: "",
    smtp_username: "",
    smtp_password: "",
    smtp_secure: false,
    smtp_require_tls: true,
    userId,
  });

  // const handleLogin = (provider) => {
  //   const queryString = new URLSearchParams({ userId, redirectUrl }).toString();
  //   window.location.href = `${BASE_URI}/auth/login/${provider}?${queryString}`;
  // };

  const handleLogin = (provider) => {
    const queryString = new URLSearchParams({ userId, redirectUrl }).toString();
    console.log(queryString);
    window.location.href = `${BASE_URI}/auth/login/${provider}?${queryString}`;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("SMTP Config Submitted:", formData);
    const queryString = new URLSearchParams({ userId, redirectUrl }).toString();
    // You can now send this to your backend using fetch or axios
    axios({
      method: "POST",
      url: `${BASE_URI}/auth/imap-user?${queryString}`,
      data: {
        smtp_host: formData.smtp_host,
        smtp_username: formData.smtp_username,
        smtp_password: formData.smtp_password,
        smtp_port: formData.smtp_port,
      },
    }).then(() => {
      window.location.href = redirectUrl;
    });
    setShowModal(false);
  };

  return (
    <div className="login-container">
      <h1 className="login-title">Login with</h1>

      <button onClick={() => handleLogin("google")} className="login-button">
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt="Google"
          className="login-logo"
        />
        <span>Continue with Google</span>
      </button>

      <button onClick={() => handleLogin("microsoft")} className="login-button">
        <img
          src="https://www.svgrepo.com/show/503427/microsoft-outlook.svg"
          alt="Microsoft"
          className="login-logo"
        />
        <span>Continue with Microsoft</span>
      </button>

      <button
        onClick={() => handleLogin("apple")}
        className="login-button black"
      >
        <img
          src="https://www.svgrepo.com/show/511330/apple-173.svg"
          alt="Apple"
          className="login-logo invert"
        />
        <span>Continue with Apple</span>
      </button>

      <button onClick={() => setShowModal(true)} className="login-button blue">
        <img
          src="https://www.svgrepo.com/show/374079/email.svg"
          alt="SMTP"
          className="login-logo"
        />
        <span>Configure SMTP</span>
      </button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>SMTP Configuration</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="smtp_host"
                placeholder="SMTP Host"
                value={formData.smtp_host}
                onChange={handleChange}
                required
              />
              <input
                type="number"
                name="smtp_port"
                placeholder="SMTP Port"
                value={formData.smtp_port}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="smtp_username"
                placeholder="SMTP Username"
                value={formData.smtp_username}
                onChange={handleChange}
                required
              />
              <input
                type="password"
                name="smtp_password"
                placeholder="SMTP Password"
                value={formData.smtp_password}
                onChange={handleChange}
                required
              />
              <label>
                <input
                  type="checkbox"
                  name="smtp_secure"
                  checked={formData.smtp_secure}
                  onChange={handleChange}
                />
                Use Secure Connection (SSL)
              </label>
              <label>
                <input
                  type="checkbox"
                  name="smtp_require_tls"
                  checked={formData.smtp_require_tls}
                  onChange={handleChange}
                />
                Require TLS
              </label>
              <div className="modal-actions">
                <button type="submit" onClick={handleSubmit}>
                  Save
                </button>
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
