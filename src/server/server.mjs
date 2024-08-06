import express from "express";
import mysql from "mysql";
import bodyParser from "body-parser";
import cors from "cors"; // Import cors package

// Create Express app
const app = express();
const port = 30000;

// Middleware to parse JSON
app.use(bodyParser.json());

// Use CORS middleware
app.use(cors()); // Enable CORS for all routes

// Create a connection pool
const pool = mysql.createPool({
  connectionLimit: 10, // Adjust as needed
  host: "178.128.221.254",
  user: "sptnzkeaee",
  password: "McS7Qu279P",
  database: "sptnzkeaee",
  port: 3306,
});

// Handle connection errors
pool.on("error", function (err) {
  console.error("Database connection error: " + err.stack);
  if (err.code === "PROTOCOL_CONNECTION_LOST" || err.code === "ECONNRESET") {
    console.error("Attempting to reconnect...");
  } else {
    throw err;
  }
});

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to my server!!!!");
});

// Listen to POST requests to /api/data-capture
app.post("/api/data-capture", function (req, res) {
  const items = req.body;

  if (!Array.isArray(items)) {
    res.status(400).send("Invalid data format, expected an array of items");
    return;
  }

  // Validate each item
  for (const item of items) {
    if (!item.do_num) {
      res.status(400).send("DO Number is required.");
      return;
    } else if (!item.sku) {
      res.status(400).send("SKU is required.");
      return;
    } else if (!item.serial_num) {
      res.status(400).send("Serial Number is required.");
      return;
    }
  }

  // Extract unique do_nums
  const uniqueDoNums = [...new Set(items.map((item) => item.do_num))];

  pool.getConnection(function (err, connection) {
    if (err) {
      console.error("Error getting connection from pool: " + err.stack);
      res
        .status(500)
        .send("Error getting connection from pool: " + err.message);
      return;
    }

    // Insert into order table if not already present
    const query2 = "INSERT IGNORE INTO `order` (`do_num`) VALUES ?";
    const values2 = uniqueDoNums.map((doNum) => [doNum]);

    connection.query(query2, [values2], function (err, result) {
      if (err) {
        console.error("Error inserting into order table: " + err.stack);
        res
          .status(500)
          .send("Error inserting into order table: " + err.message);
        connection.release();
        return;
      }

      // Prepare data for order_item table
      const query = "INSERT INTO order_item (do_num, sku, serial_num) VALUES ?";
      const values = items.map((item) => [
        item.do_num,
        item.sku,
        item.serial_num,
      ]);

      connection.query(query, [values], function (err, result) {
        if (err) {
          console.error("Error inserting into order_item table: " + err.stack);
          res
            .status(500)
            .send("Error inserting into order_item table: " + err.message);
        } else {
          res.send("Success");
        }
        connection.release();
      });
    });
  });
});

// New route to fetch data from the 'order' table
app.get("/api/orders", function (req, res) {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.error("Error getting connection from pool: " + err.stack);
      res
        .status(500)
        .send("Error getting connection from pool: " + err.message);
      return;
    }

    const query = "SELECT * FROM `order`"; // Adjust table name if needed

    connection.query(query, function (err, results) {
      if (err) {
        console.error("Error fetching data from order table: " + err.stack);
        res
          .status(500)
          .send("Error fetching data from order table: " + err.message);
      } else {
        res.json(results);
      }
      connection.release();
    });
  });
});

// New route to fetch data from the 'order_item' table with optional filters
app.get("/api/items", function (req, res) {
  // Extract query parameters
  const { do_num, created_at } = req.query;

  // Build the SQL query dynamically based on provided parameters
  let query = "SELECT * FROM `order_item`";
  const queryParams = [];

  // Add filters to the query if parameters are provided
  if (do_num || created_at) {
    query += " WHERE";
    if (do_num) {
      query += " do_num = ?";
      queryParams.push(do_num);
    }
    if (created_at) {
      if (queryParams.length > 0) {
        query += " AND";
      }
      query += " created_at = ?";
      queryParams.push(created_at);
    }
  }

  pool.getConnection(function (err, connection) {
    if (err) {
      console.error("Error getting connection from pool: " + err.stack);
      res
        .status(500)
        .send("Error getting connection from pool: " + err.message);
      return;
    }

    connection.query(query, queryParams, function (err, results) {
      if (err) {
        console.error(
          "Error fetching data from order_item table: " + err.stack
        );
        res
          .status(500)
          .send("Error fetching data from order_item table: " + err.message);
      } else {
        res.json(results);
      }
      connection.release();
    });
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
