import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // Make sure to create this CSS file

function Login() {
  const [username, setUsername] = useState("");
  const [passwordOrPhilhealth, setPasswordOrPhilhealth] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await axios.post("http://localhost/hc_assist2/src/login.php", {
        username,
        passwordOrPhilhealth,
      });

      if (res.data.success) {
        // Save user info to localStorage
        if (res.data.user) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }

        // Navigate based on role
        switch (res.data.role) {
          case "admin":
            navigate("/admin_folder/admin");
            break;
          case "staff":
            navigate("/staff_folder/staff");
            break;
          case "midwife":
            navigate("/midwife_folder/midwife");
            break;
          case "patient":
            navigate("/patient_folder/patient");
            break;
          default:
            setError("Unknown role.");
        }
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      console.error(err);
      setError("Login failed. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-left">
          <div className="login-logo">
            <div className="logo-icon">
              <i className="pulse"></i>
            </div>
            <h1>HC-<span>Assist</span></h1>
          </div>
          <div className="welcome-text">
            <h2>Good day!</h2>
            <p>Log in to access your healthcare management dashboard</p>
          </div>
        </div>

        <div className="login-right">
          <div className="login-form-container">
            <h2>Sign In</h2>
            <p className="form-subtitle">Enter your credentials to continue</p>
            
            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <div className="input-group">
                  <span className="input-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </span>
                  <input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password or PhilHealth #</label>
                <div className="input-group">
                  <span className="input-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </span>
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password or PhilHealth #"
                    value={passwordOrPhilhealth}
                    onChange={(e) => setPasswordOrPhilhealth(e.target.value)}
                    required
                  />
                </div>
              </div>



              <button 
                type="submit" 
                className={`login-button ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="spinner"></span>
                ) : (
                  "Sign In"
                )}
              </button>

              {error && <div className="error-message">{error}</div>}




            </form>
          </div>
        </div>
      </div>
      
      <footer className="login-footer">
        <p>&copy; {new Date().getFullYear()} HealthCare Assist. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Login;