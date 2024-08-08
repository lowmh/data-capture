// ** React
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// ** MUI Material
import { Grid, Button, Typography } from "@mui/material";

// ** Custom Component Import
import CustomTextField from "../component/text-field.js";

// ** Axios
import axios from "axios";

function BarcodeScannerPage() {
  const userData = localStorage.getItem("userData");
  const data = JSON.parse(userData);
  const { accessToken } = data;

  const [doNum, setDoNum] = useState("");
  const [serialNum, setSerialNum] = useState("");
  const [sku, setSku] = useState("");
  const [id, setId] = useState(1);
  const [allResults, setAllResults] = useState([]);
  const [errors, setErrors] = useState({
    doNumber: "",
    sku: "",
    serialNumber: "",
  });

  useEffect(() => {
    const storedData = sessionStorage.getItem("itemData");
    const do_number = sessionStorage.getItem("do_number");
    if (storedData) {
      const data = JSON.parse(storedData);
      if (data.length > 0) {
        setAllResults(data);
      }
    }
    if (do_number) {
      setDoNum(do_number || "");
    }
  }, []);

  const handleSubmit = () => {
    let valid = true;
    const newErrors = { doNumber: "", sku: "", serialNumber: "" };

    if (!doNum) {
      newErrors.doNumber = "DO Number is required.";
      valid = false;
    }
    if (!sku) {
      newErrors.sku = "SKU is required.";
      valid = false;
    }
    if (!serialNum) {
      newErrors.serialNumber = "Serial Number is required.";
      valid = false;
    }

    if (!valid) {
      setErrors(newErrors);
      return;
    }

    const result = {
      id: id,
      sku: sku,
      serialNum: serialNum,
    };

    setId(id + 1);
    setAllResults((prevResults) => {
      const updatedResults = [...prevResults, result];
      sessionStorage.setItem("itemData", JSON.stringify(updatedResults));
      sessionStorage.setItem("do_number", doNum);
      return updatedResults;
    });

    setSerialNum("");
    setErrors({ doNumber: "", sku: "", serialNumber: "" });
  };

  const handleCertainRemove = (index) => () => {
    setAllResults((prevResults) => {
      const updatedResults = prevResults.filter((_, i) => i !== index);
      sessionStorage.setItem("itemData", JSON.stringify(updatedResults));
      return updatedResults;
    });
  };

  const handleFormSubmit = async () => {
    let valid = true;
    const newErrors = { doNumber: "" };

    if (!doNum) {
      newErrors.doNumber = "DO Number is required.";
      valid = false;
    }

    if (!valid) {
      setErrors(newErrors);
      return;
    }

    const jsonData = allResults.map((result) => ({
      do_num: doNum,
      sku: result.sku,
      serial_num: result.serialNum,
    }));

    try {
      const response = await axios.post(
        "http://localhost:40000/api/datacapture",
        jsonData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data === "Success") {
        alert("Data submitted successfully!");
        handleFormClear(); // Clear results after success
      } else {
        alert("Unexpected response from server.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("There was an error submitting the data: " + error.message);
    }
  };

  const handleFormClear = () => {
    sessionStorage.removeItem("itemData");
    sessionStorage.removeItem("do_number");
    setDoNum("");
    setAllResults([]);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <Grid container spacing={2} p={5}>
      <Grid item xs={12}>
        <h1>Barcode Scanner</h1>
        <p>Data capture page</p>
      </Grid>
      <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Link style={{ color: "rgb(91,102,112,.75)" }} to="/">
          <Button variant="outlined" color="inherit">
            Back
          </Button>
        </Link>
      </Grid>
      <Grid item xs={12} sm={3}>
        <CustomTextField
          fullWidth
          label="DO number"
          placeholder="xxxxxx"
          value={doNum}
          onChange={(e) => setDoNum(e.target.value)}
        />
        {errors.doNumber && (
          <Typography color="error">{errors.doNumber}</Typography>
        )}
      </Grid>
      <Grid item xs={12} sm={3}>
        <CustomTextField
          fullWidth
          label="SKU"
          placeholder="xxxxxx"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
        />
        {errors.sku && <Typography color="error">{errors.sku}</Typography>}
      </Grid>
      <Grid item xs={12} sm={7}>
        <CustomTextField
          fullWidth
          label="Serial Number"
          placeholder="xxxxxx"
          value={serialNum}
          onChange={(e) => setSerialNum(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        {errors.serialNumber && (
          <Typography color="error">{errors.serialNumber}</Typography>
        )}
      </Grid>
      {allResults.length > 0 && (
        <Grid id="result-table" item xs={12} style={{ marginTop: 20 }}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>SKU</th>
                <th>Serial Number</th>
                <th>Remove</th>
              </tr>
            </thead>
            <tbody>
              {allResults.map((result, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{result.sku}</td>
                  <td>{result.serialNum}</td>
                  <td>
                    <Button onClick={handleCertainRemove(index)}>x</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Grid
            item
            xs={12}
            container
            spacing={2}
            justifyContent="flex-start"
            style={{ marginTop: 20, paddingBottom: 50 }}
          >
            <Grid item>
              <Button
                variant="contained"
                color="inherit"
                onClick={handleFormSubmit}
              >
                Submit
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleFormClear}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </Grid>
      )}
    </Grid>
  );
}

export default BarcodeScannerPage;
