import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [passwordOrPhilhealth, setPasswordOrPhilhealth] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

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
      setError("Login failed. Try again.");
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password or PhilHealth #"
        value={passwordOrPhilhealth}
        onChange={(e) => setPasswordOrPhilhealth(e.target.value)}
        required
      />
      <button type="submit">Login</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}

export default Login;
