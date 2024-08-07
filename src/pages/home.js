// ** React
import React from "react";
import { Link } from "react-router-dom";

// ** Mui Material
import { Button, Grid } from "@mui/material";

function HomePage() {
  return (
    <Grid container spacing={5} justifyContent="center" mt={3}>
      <Grid item xs={12}>
        <h1>EIG Hong Kong</h1>
        <p>Data Capture </p>
      </Grid>
      <Grid item xs={12} sm={3}>
        <Link to="/data-capture/qr">
          <Button variant="contained" sx={{ width: "15rem", height: "3rem" }}>
            QR Scanner
          </Button>
        </Link>
      </Grid>
      <Grid item xs={12} sm={3}>
        <Link to="/data-capture/barcode">
          <Button variant="contained" sx={{ width: "15rem", height: "3rem" }}>
            Barcode Scanner
          </Button>
        </Link>
      </Grid>
      <Grid item xs={12} sm={3}>
        <Link to="/table/order">
          <Button variant="contained" sx={{ width: "15rem", height: "3rem" }}>
            DO Number Table
          </Button>
        </Link>
      </Grid>
    </Grid>
  );
}

export default HomePage;
