// ** React
import React from "react";
import { Link } from "react-router-dom";

// ** Mui Material
import { Button, Grid } from "@mui/material";

function HomePage() {
  return (
    <Grid container>
      <Grid container spacing={5} justifyContent="center">
        <Grid item xs={12} mt={5}>
          <h2>EIG Data Capture Hong Kong</h2>
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
        <Grid item xs={12} sm={3}>
          <Link to="/table/item">
            <Button variant="contained" sx={{ width: "15rem", height: "3rem" }}>
              Items Table
            </Button>
          </Link>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default HomePage;
