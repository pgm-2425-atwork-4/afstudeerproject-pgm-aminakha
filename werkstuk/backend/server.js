const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json()); // Allow JSON body parsing

// ✅ Connect to MySQL
const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "root", // Change if needed
  database: "gym_app",
});

db.connect((err) => {
  if (err) {
    console.error("🔥 MySQL Connection Error:", err);
    return;
  }
  console.log("✅ Connected to MySQL!");
});

// ✅ API: Get all categories
app.get("/categories", (req, res) => {
  const sql = "SELECT * FROM categories";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("🔥 Error fetching data:", err);
      return res.status(500).json({ error: err });
    }
    res.json(results);
  });
});

// ✅ API: Add a new category
app.post("/categories", (req, res) => {
  const { name, image_url } = req.body;

  if (!name || !image_url) {
    return res.status(400).json({ error: "Name and image URL are required" });
  }

  const sql = "INSERT INTO categories (name, image_url) VALUES (?, ?)";
  const values = [name, image_url];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("🔥 Error inserting data:", err);
      return res.status(500).json({ error: err });
    }
    res.status(201).json({ id: result.insertId, name, image_url });
  });
});

// ✅ Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
