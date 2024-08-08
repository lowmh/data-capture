// ** React
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

// ** Axios
import axios from "axios";

// ** Mui Material
import { Button, Grid, IconButton } from "@mui/material";
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

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://phpstack-649761-4774899.cloudwaysapps.com/api/orders`
        );
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

  const handleItemTable = (id) => {
    sessionStorage.setItem("ItemId", id);
    navigate("/table/item");
  };

  return (
    <Grid container spacing={2} p={5}>
      <Grid item xs={12}>
        <h1>Order Table Page</h1>
        <p>This is the Order Table Page!</p>
      </Grid>
      <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Link to="/">
          <Button variant="outlined" color="inherit">
            back
          </Button>
        </Link>
      </Grid>
      {showTable && (
        <Grid item xs={12}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>DO Number</th>
                <th>Created At</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((item, index) => (
                <tr key={item.do_id}>
                  <td>{index + 1}</td>
                  <td>{item.do_num}</td>
                  <td>{formatDate(item.created_at)}</td>
                  <td>
                    <IconButton
                      sx={{ fill: "rgb(91,102,112" }}
                      onClick={() => handleItemTable(item.do_id)}
                    >
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
