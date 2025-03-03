const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("uploads")); // ✅ Serve uploaded images

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

// ✅ Configure `multer` to store images in "uploads" folder
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});
const upload = multer({ storage });

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

// ✅ API: Upload Image & Save Category
app.post("/categories", upload.single("image"), (req, res) => {
  const { name } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  if (!name || !imageUrl) {
    return res.status(400).json({ error: "Name and image are required" });
  }

  const sql = "INSERT INTO categories (name, image_url) VALUES (?, ?)";
  const values = [name, imageUrl];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("🔥 Error inserting data:", err);
      return res.status(500).json({ error: err });
    }
    res.status(201).json({ id: result.insertId, name, image_url: imageUrl });
  });
});

// ✅ Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
