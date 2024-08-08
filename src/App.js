// src/App.js
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import "./App.css";

// ** Styles
import "./styles/base.css";
import logo from "./logo.webp";

// ** Pages
import HomePage from "./pages/home";
import LoginPage from "./pages/login";
import QrScannerPage from "./pages/qrscanner";
import BarcodeScannerPage from "./pages/barcodescanner";
import OrderTablePage from "./pages/order_table";
import OrderItemTablePage from "./pages/orderItem_table";
import LoadingPage from "./pages/loading";

// ** Mui Material
import { Button } from "@mui/material";

// ** Axios
import axios from "axios";

function Navigation({ isAuthenticated, setIsAuthenticated, isLoading }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [error, setError] = useState(""); // Define error state
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const refreshToken = async () => {
      const userData = localStorage.getItem("userData");

      if (userData) {
        try {
          const data = JSON.parse(userData);
          const { accessToken, refreshToken } = data;

          // Make a request to refresh the token
          const response = await axios.post(
            "http://localhost:40000/api/refresh-token",
            { accessToken, refreshToken }
          );

          if (response.data && response.data.accessToken) {
            const newAccessToken = response.data.accessToken;
            const newTokens = { accessToken: newAccessToken, refreshToken };

            // Update localStorage with new tokens
            localStorage.setItem("userData", JSON.stringify(newTokens));
            setIsAuthenticated(true);

            // Redirect to the home page if the user is on the login page
            if (location.pathname === "/login") {
              navigate("/");
            }
          } else {
            // If no accessToken is returned, remove userData and redirect to login
            localStorage.removeItem("userData");
            setIsAuthenticated(false);
            navigate("/login");
          }
        } catch (error) {
          console.error("Error refreshing token:", error);
          localStorage.removeItem("userData");
          setIsAuthenticated(false);
          navigate("/login");
        }
      } else {
        // No userData found, redirect to login
        setIsAuthenticated(false);
        navigate("/login");
      }
    };

    refreshToken();
  }, [navigate, location.pathname, setIsAuthenticated]);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const data = localStorage.getItem("userData");
      if (!data) {
        throw new Error("No user data found.");
      }

      const jsonData = JSON.parse(data);
      const response = await axios.post("http://localhost:40000/api/logout", {
        accessToken: jsonData.accessToken,
      });

      if (response.status === 200) {
        localStorage.removeItem("userData");
        setIsAuthenticated(false);
        navigate("/login");
      } else {
        setError("An unexpected response was received.");
      }
    } catch (error) {
      if (error.response) {
        // Access error response data safely
        if (error.response.status === 400) {
          setError(
            error.response.data.message || "Invalid logout credentials."
          );
        } else {
          setError("An unexpected error occurred. Please try again.");
        }
      } else if (error.request) {
        // Handle network errors
        setError("Network error. Please check your connection and try again.");
      } else {
        // Handle other errors
        setError("An error occurred. Please try again.");
      }
      console.error("Error fetching data:", error);
    }
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="App">
      <header className="App-header">
        <div id="mobile-drawer-icon" onClick={toggleDrawer}>
          &#9776;
        </div>
        <Link to="/">
          <img src={logo} className="App-logo" alt="logo" />
        </Link>
        {isAuthenticated && (
          <>
            <nav className="desktop-nav">
              <ul>
                <li>
                  <Link to="/">
                    <Button color="inherit">Home</Button>
                  </Link>
                </li>
                <li>
                  <Link to="/data-capture/barcode">
                    <Button color="inherit">Data Capture</Button>
                  </Link>
                </li>
                <li>
                  <Link to="/table/order">
                    <Button color="inherit">Table</Button>
                  </Link>
                </li>
                <li>
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </li>
              </ul>
            </nav>

            {drawerOpen && (
              <nav className="mobile-nav">
                <ul>
                  <li>
                    <Link to="/" onClick={toggleDrawer}>
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link to="/data-capture/barcode" onClick={toggleDrawer}>
                      Data Capture
                    </Link>
                  </li>
                  <li>
                    <Link to="/table/order" onClick={toggleDrawer}>
                      <Button color="inherit">Table</Button>
                    </Link>
                  </li>
                  <li>
                    <Button
                      variant="outlined"
                      color="inherit"
                      onClick={handleLogout}
                    >
                      Logout
                    </Button>
                  </li>
                </ul>
              </nav>
            )}
          </>
        )}
      </header>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/" />
            ) : (
              <LoginPage setAuth={setIsAuthenticated} />
            )
          }
        />
        <Route
          path="/"
          element={isAuthenticated ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/data-capture/qr"
          element={
            isAuthenticated ? <QrScannerPage /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/data-capture/barcode"
          element={
            isAuthenticated ? <BarcodeScannerPage /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/table/order"
          element={
            isAuthenticated ? <OrderTablePage /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/table/item"
          element={
            isAuthenticated ? <OrderItemTablePage /> : <Navigate to="/login" />
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const userData = localStorage.getItem("userData");

      if (userData) {
        try {
          const data = JSON.parse(userData);
          const { accessToken, refreshToken } = data;

          // Check if access token is still valid
          const response = await axios.post(
            "http://localhost:40000/api/refresh-token",
            { accessToken, refreshToken }
          );

          if (response.data && response.data.valid) {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error("Error verifying token:", error);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  return (
    <Router>
      <Navigation
        isAuthenticated={isAuthenticated}
        setIsAuthenticated={setIsAuthenticated}
        isLoading={isLoading}
      />
    </Router>
  );
}

export default App;
