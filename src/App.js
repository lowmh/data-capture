// ** React
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

// ** Mui Material
import { Button } from "@mui/material";

function Navigation({ isAuthenticated, setIsAuthenticated }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const accessCode = localStorage.getItem("accessCode");
    if (accessCode) {
      setIsAuthenticated(true);
      if (location.pathname === "/login") {
        navigate("/");
      }
    }
  }, [navigate, location.pathname, setIsAuthenticated]);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessCode");
    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <div className="App">
      <header className="App-header">
        <div id="mobile-drawer-icon" onClick={toggleDrawer}>
          &#9776; {/* This is a hamburger icon */}
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
                  <Link to="/data-capture/qr">
                    <Button color="inherit">QR scanner</Button>
                  </Link>
                </li>
                <li>
                  <Link to="/data-capture/barcode">
                    <Button color="inherit">Barcode scanner</Button>
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
                    <Link to="/data-capture/qr" onClick={toggleDrawer}>
                      QR scanner
                    </Link>
                  </li>
                  <li>
                    <Link to="/data-capture/barcode" onClick={toggleDrawer}>
                      Barcode scanner
                    </Link>
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
          element={<LoginPage setAuth={setIsAuthenticated} />}
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

  return (
    <Router>
      <Navigation
        isAuthenticated={isAuthenticated}
        setIsAuthenticated={setIsAuthenticated}
      />
    </Router>
  );
}

export default App;
