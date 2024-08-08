// ** React
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// ** Styles
import "../styles/login.css";

// ** Mui Material
import { Card } from "@mui/material";

// ** Axios
import axios from "axios";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = { username, password };
      const response = await axios.post(
        "https://data-capture-api-f5guf5dddsa4e4ey.southeastasia-01.azurewebsites.net/api/login",
        data
      );
      if (response && response.data) {
        localStorage.setItem("userData", JSON.stringify(response.data));
        navigate("/");
      }
    } catch (error) {
      if (error.response) {
        // Access error response data safely
        if (error.response.status === 400) {
          setError(error.response.data.message || "Invalid login credentials.");
        } else {
          setError("An unexpected error occurred. Please try again.");
        }
      } else {
        setError("Network error. Please check your connection and try again.");
      }
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div className="login-container">
      <h1>Login Page</h1>
      <Card>
        <form className="form" onSubmit={handleLogin}>
          <div>
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit">Login</button>
          {error && <p className="error">{error}</p>}
        </form>
      </Card>
    </div>
  );
}

export default LoginPage;
