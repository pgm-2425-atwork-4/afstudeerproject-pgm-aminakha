require('dotenv').config(); // Load environment variables

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcrypt");

const app = express();

// ✅ Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use('/uploads', express.static("uploads")); // ✅ Directly use "uploads" without __dirname

app.get('/', (req, res) => {
  res.status(200).send("🚀 Backend is running!");
});

app.get('/ping', (req, res) => {
  res.json({ message: "✅ Backend is alive!" }); // ✅ Now returns valid JSON
});

// ✅ Connect to MySQL Database
const db = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("🔥 MySQL Connection Error:", err);
  } else {
    console.log("✅ Connected to MySQL!");
    connection.release();
  }
});

// ✅ Multer Setup for Image Uploads
const storage = multer.diskStorage({
  destination: "uploads/", // ✅ No need for __dirname
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});
const upload = multer({ storage });

/* ============================================
 ✅ API: Register User with Profile Image Upload
=============================================== */
app.post("/register", upload.single("profileImage"), async (req, res) => {
  try {
    const { username, firstname, lastname, email, password, birthday } = req.body;
    const profileImage = req.file ? `/uploads/${req.file.filename}` : null;

    if (!username || !email || !password || !birthday) {
      return res.status(400).json({ error: "❌ Missing required fields" });
    }

    // 🔐 Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql =
      "INSERT INTO users (username, firstname, lastname, email, password, birthday, profile_image) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const values = [username, firstname, lastname, email, hashedPassword, birthday, profileImage];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("🔥 Error inserting user:", err);
        return res.status(500).json({ error: err });
      }
      res.status(201).json({ message: "✅ User Registered!", userId: result.insertId, profileImage });
    });
  } catch (error) {
    console.error("🔥 Error in registration:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/* ============================================
 ✅ API: User Login (Check Hashed Password)
=============================================== */
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error("🔥 Error fetching user:", err);
      return res.status(500).json({ error: err });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "❌ User not found" });
    }

    const user = results[0];

    // 🔐 Compare entered password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "❌ Incorrect password" });
    }

    res.json({
      message: "✅ Login successful!",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile_image: `https://afstudeerproject-pgm-aminakha.onrender.com${user.profile_image}`,
      },
    });
  });
});

/* ============================================
 ✅ API: Fetch All Users
=============================================== */
app.get("/users", (req, res) => {
  const sql = "SELECT id FROM users"; // ✅ Fetch only user IDs
  db.query(sql, (err, results) => {
    if (err) {
      console.error("🔥 Error fetching user IDs:", err);
      return res.status(500).json({ error: err });
    }
    res.json(results); // ✅ Return all user IDs as JSON
  });
});

/* ============================================
 ✅ API: Fetch User Details (Including Avatar)
=============================================== */
app.get("/users/:id", (req, res) => {
  const userId = req.params.id;
  const sql = "SELECT * FROM users WHERE id = ?";

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("🔥 Error fetching user:", err);
      return res.status(500).json({ error: err });
    }

    if (result.length === 0) {
      console.log("❌ User not found:", userId);
      return res.status(404).json({ error: "User not found" });
    }

    console.log("✅ User data fetched:", result[0]); // 🔍 Debugging: Log user data
    res.json(result[0]); // ✅ Send only the user object
  });
});

/* ============================================
 ✅ API: Fetch All Categories
=============================================== */
app.get("/categories", (req, res) => {
  const sql = "SELECT * FROM categories";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("🔥 Error fetching categories:", err);
      return res.status(500).json({ error: err });
    }
    res.json(results);
  });
});

app.get("/gyms", (req, res) => {
  const sql = "SELECT * FROM gyms";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("🔥 Error fetching gyms:", err);
      return res.status(500).json({ error: err });
    }
    res.json(results);
  });
});

/* ============================================
 ✅ API: Upload Image & Save Category
=============================================== */
app.post("/categories", upload.single("image"), (req, res) => {
  const { name } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  if (!name || !imageUrl) {
    return res.status(400).json({ error: "❌ Name and image are required" });
  }

  const sql = "INSERT INTO categories (name, image_url) VALUES (?, ?)";
  const values = [name, imageUrl];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("🔥 Error inserting category:", err);
      return res.status(500).json({ error: err });
    }
    res.status(201).json({ id: result.insertId, name, image_url: imageUrl });
  });
});

/* ============================================
 ✅ API: Delete All Users (TRUNCATE)
=============================================== */
app.delete("/users/truncate", (req, res) => {
  const sql = "TRUNCATE TABLE users";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("🔥 Error truncating users table:", err);
      return res.status(500).json({ error: err });
    }
    res.json({ message: "✅ All users deleted!" });
  });
});

/* ============================================
 ✅ Start Server
=============================================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
