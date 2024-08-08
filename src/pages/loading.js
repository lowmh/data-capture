// ** React
import React from "react";

// ** Styles
import "../styles/loading.css";

function LoadingPage() {
  return (
    <div className="loading-page">
      <div className="spinner"></div>
      <h1>Loading...</h1>
    </div>
  );
}

export default LoadingPage;
