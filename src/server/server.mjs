import express from "express";
import mysql from "mysql";
import bcrypt from "bcryptjs";
import bodyParser from "body-parser";
import cors from "cors";
import jwt from "jsonwebtoken";

// Create Express app
const app = express();
const port = 30000;

// Middleware to parse JSON
app.use(bodyParser.json());

// Use CORS middleware
app.use(cors());

// Create a connection pool
const pool = mysql.createPool({
  connectionLimit: 10,
  host: "178.128.221.254",
  user: "sptnzkeaee",
  password: "McS7Qu279P",
  database: "sptnzkeaee",
  port: 3306,
});

// Handle connection errors
pool.on("error", (err) => {
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

const JWT_SECRET = "EIGDATACAPTURE"; // Use a secure secret key
const JWT_EXPIRATION = "1h";
const REFRESH_EXPIRATION = "7d";

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

// Login route
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send("Username and password are required.");
  }

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting connection from pool: " + err.stack);
      return res.status(500).send("Database connection error.");
    }

    const query = "SELECT * FROM login WHERE username = ?";
    connection.query(query, [username], async (err, results) => {
      connection.release();

      if (err) {
        console.error("Error fetching data from login table: " + err.stack);
        return res.status(500).send("Error fetching user data.");
      }

      if (results.length === 0) {
        return res.status(400).send("Invalid username or password.");
      }

      const user = results[0];

      // Compare the provided password with the stored hash
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).send("Invalid username or password.");
      }

      // Generate tokens
      const accessToken = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRATION }
      );
      const refreshToken = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: REFRESH_EXPIRATION }
      );

      // Insert or update tokens in the database
      const insertOrUpdateQuery = `
        INSERT INTO tokens (user_id, access_token, refresh_token, access_token_expires_at, refresh_token_expires_at)
        VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR), DATE_ADD(NOW(), INTERVAL 7 DAY))
        ON DUPLICATE KEY UPDATE
          access_token = VALUES(access_token),
          refresh_token = VALUES(refresh_token),
          access_token_expires_at = VALUES(access_token_expires_at),
          refresh_token_expires_at = VALUES(refresh_token_expires_at)
      `;

      pool.getConnection((err, connection) => {
        if (err) {
          console.error("Error getting connection from pool: " + err.stack);
          return res.status(500).send("Database connection error.");
        }

        connection.query(
          insertOrUpdateQuery,
          [user.id, accessToken, refreshToken],
          (err) => {
            connection.release();

            if (err) {
              console.error("Error inserting or updating tokens: " + err.stack);
              return res.status(500).send("Error storing tokens.");
            }

            res.status(200).json({ accessToken, refreshToken });
          }
        );
      });
    });
  });
});

// Route to check token validity and refresh if necessary
app.post("/api/refresh-token", (req, res) => {
  const { accessToken, refreshToken } = req.body;

  if (!accessToken || !refreshToken) {
    return res.status(400).send("Access token and refresh token are required.");
  }

  // Verify the access token
  const decodedAccessToken = verifyToken(accessToken);

  if (decodedAccessToken) {
    // Access token is valid
    return res
      .status(200)
      .json({ accessToken: accessToken, message: "Access token is valid." });
  } else {
    // Access token is invalid or expired, verify the refresh token
    jwt.verify(refreshToken, JWT_SECRET, (err, decodedRefreshToken) => {
      if (err) {
        return res.status(401).send("Invalid or expired refresh token.");
      }

      // Refresh token is valid, generate new access token
      const newAccessToken = jwt.sign(
        { id: decodedRefreshToken.id, username: decodedRefreshToken.username },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRATION }
      );

      // Optionally, you could update the refresh token in the database here

      return res.status(200).json({ accessToken: newAccessToken });
    });
  }
});

// Register user route
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send("Username and password are required.");
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the user into the login table
    const query =
      "INSERT INTO login (username, password, created_at, updated_at) VALUES (?, ?, NOW(), NOW())";

    pool.getConnection((err, connection) => {
      if (err) {
        console.error("Error getting connection from pool: " + err.stack);
        return res.status(500).send("Database connection error.");
      }

      connection.query(query, [username, hashedPassword], (err, results) => {
        connection.release();

        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).send("Username already exists.");
          }
          console.error("Error inserting user into login table: " + err.stack);
          return res.status(500).send("Error registering user.");
        }

        res.status(201).send("User registered successfully.");
      });
    });
  } catch (error) {
    console.error("Error hashing password: " + error.stack);
    res.status(500).send("Error registering user.");
  }
});

// Handle POST requests to /api/data-capture
app.post("/api/datacapture", (req, res) => {
  const items = req.body;

  if (!Array.isArray(items)) {
    return res
      .status(400)
      .send("Invalid data format, expected an array of items");
  }

  // Validate each item
  for (const item of items) {
    if (!item.do_num || !item.sku || !item.serial_num) {
      return res
        .status(400)
        .send("DO Number, SKU, and Serial Number are required.");
    }
  }

  // Extract unique do_nums
  const uniqueDoNums = [...new Set(items.map((item) => item.do_num))];

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting connection from pool: " + err.stack);
      return res
        .status(500)
        .send("Error getting connection from pool: " + err.message);
    }

    // Insert into order table if not already present
    const query2 = "INSERT IGNORE INTO `order` (`do_num`) VALUES ?";
    const values2 = uniqueDoNums.map((doNum) => [doNum]);

    connection.query(query2, [values2], (err) => {
      if (err) {
        console.error("Error inserting into order table: " + err.stack);
        connection.release();
        return res
          .status(500)
          .send("Error inserting into order table: " + err.message);
      }

      // Fetch `do_id` values from the `order` table for the inserted `do_num`
      const fetchDoIdQuery =
        "SELECT do_num, do_id FROM `order` WHERE do_num IN (?)";

      connection.query(fetchDoIdQuery, [uniqueDoNums], (err, results) => {
        if (err) {
          console.error("Error fetching do_id from order table: " + err.stack);
          connection.release();
          return res
            .status(500)
            .send("Error fetching do_id from order table: " + err.message);
        }

        // Map do_num to do_id
        const doNumToId = results.reduce((acc, row) => {
          acc[row.do_num] = row.do_id;
          return acc;
        }, {});

        // Prepare data for order_item table
        const orderItemValues = items.map((item) => [
          item.do_num,
          item.sku,
          item.serial_num,
          doNumToId[item.do_num], // Use mapped do_id
        ]);

        const query =
          "INSERT INTO `order_item` (do_num, sku, serial_num, do_id) VALUES ?";

        connection.query(query, [orderItemValues], (err) => {
          if (err) {
            console.error(
              "Error inserting into order_item table: " + err.stack
            );
            connection.release();
            return res
              .status(500)
              .send("Error inserting into order_item table: " + err.message);
          }

          res.send("Success");
          connection.release();
        });
      });
    });
  });
});

// Route to fetch data from the 'order' table
app.get("/api/orders", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting connection from pool: " + err.stack);
      return res
        .status(500)
        .send("Error getting connection from pool: " + err.message);
    }

    const query = "SELECT * FROM `order` ORDER BY `created_at` DESC";

    connection.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching data from order table: " + err.stack);
        return res
          .status(500)
          .send("Error fetching data from order table: " + err.message);
      }
      res.json(results);
      connection.release();
    });
  });
});

// Route to fetch data from the 'order_item' table with optional filters
app.get("/api/items", (req, res) => {
  const { do_id } = req.query;

  let query = "SELECT * FROM `order_item`";
  const queryParams = [];

  if (do_id) {
    query += " WHERE do_id = ?";
    queryParams.push(do_id);
  }

  query += " ORDER BY `created_at` DESC";

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting connection from pool: " + err.stack);
      return res
        .status(500)
        .send("Error getting connection from pool: " + err.message);
    }

    connection.query(query, queryParams, (err, results) => {
      if (err) {
        console.error(
          "Error fetching data from order_item table: " + err.stack
        );
        return res
          .status(500)
          .send("Error fetching data from order_item table: " + err.message);
      }
      res.json(results);
      connection.release();
    });
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
