// ** React
import React, { useState, useEffect } from "react";

// ** Axios
import axios from "axios";

// ** Mui Material
import { Grid, IconButton } from "@mui/material";
import { Visibility } from "@mui/icons-material";

// ** Format Date
function formatDate(dateString) {
  const date = new Date(dateString);

  // Extract the components
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const year = date.getFullYear();

  // Extract time components
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedHours = String(hours).padStart(2, "0");

  return `${day}-${month}-${year} ${formattedHours}:${minutes}${ampm}`;
}

function OrderTablePage() {
  const [tableData, setTableData] = useState([]);
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:30000/api/orders");
        if (response && response.data) {
          setTableData(response.data);
          setShowTable(true);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <h1>Order Table Page</h1>
        <p>This is the Order Table Page!</p>
      </Grid>
      {showTable && (
        <Grid item xs={12}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>DO Number</th>
                <th>Created At</th>
                <th>Action.</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.do_num}</td>
                  <td>{formatDate(item.created_at)}</td>
                  <td>
                    <IconButton sx={{ fill: "rgb(91,102,112" }}>
                      <Visibility /> {/* You can use a Material-UI icon here */}
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Grid>
      )}
    </Grid>
  );
}

export default OrderTablePage;
