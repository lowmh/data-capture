// ** React
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// ** Axios
import axios from "axios";

// ** Mui Material
import { Grid, Button } from "@mui/material";

function OrderItemTablePage() {
  const [tableData, setTableData] = useState([]);
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const id = sessionStorage.getItem("ItemId");
        const response = await axios.get(
          `https://phpstack-649761-4774899.cloudwaysapps.com/api/items?do_id=${id}`,
          {
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          }
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

  return (
    <Grid container spacing={2} p={5}>
      <Grid item xs={12}>
        <h1>Order Item Table Page</h1>
        <p>This is the Order Item Table Page!</p>
      </Grid>
      <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Link to="/table/order">
          <Button variant="outlined" color="inherit">
            back
          </Button>
        </Link>
      </Grid>
      {showTable && (
        <Grid item xs={12}>
          <h2 style={{ textAlign: "left" }}>
            Do number: {tableData[0].do_num}
          </h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>SKU</th>
                <th>Serial Number</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.sku}</td>
                  <td>{item.serial_num}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Grid>
      )}
    </Grid>
  );
}

export default OrderItemTablePage;
