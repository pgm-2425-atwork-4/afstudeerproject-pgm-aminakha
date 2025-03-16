require("dotenv").config(); // Load environment variables
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");

const app = express();

// ✅ Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// ✅ Ensure 'uploads' folder exists
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// ✅ Serve static images correctly
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.status(200).send("🚀 Backend is running!");
});

app.get("/ping", (req, res) => {
  res.json({ message: "✅ Backend is alive!" });
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
  queueLimit: 0,
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
  destination: "uploads/", // ✅ Store in 'uploads/' folder
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});
const upload = multer({ storage });

/* ============================================
 ✅ API: Upload Image & Store in Database (Users)
=============================================== */
app.post("/upload/profile", upload.single("profileImage"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "❌ No file uploaded" });
  }
  
  const filePath = `/uploads/${req.file.filename}`;
  res.json({ filePath });
});

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
 ✅ API: Fetch All Users
=============================================== */
app.get("/users", (req, res) => {
  const sql = "SELECT id, username, profile_image FROM users"; // Fetch profile image too
  db.query(sql, (err, results) => {
    if (err) {
      console.error("🔥 Error fetching users:", err);
      return res.status(500).json({ error: err });
    }

    results.forEach((user) => {
      if (user.profile_image) {
        user.profile_image = `https://afstudeerproject-pgm-aminakha.onrender.com${user.profile_image}`;
      }
    });

    res.json(results);
  });
});

/* ============================================
 ✅ API: Fetch Gyms with Images
=============================================== */
app.get("/gyms", (req, res) => {
  const sql = `
    SELECT 
      g.id, g.name, g.city, g.rating, g.opening_hours, g.address, g.personal_trainer, 
      p.name AS province, 
      c.name AS category,
      i.image_url AS image,
      pr.bundle_name AS pricing_bundle, pr.price
    FROM gyms g
    JOIN provinces p ON g.province_id = p.id
    JOIN categories c ON g.category_id = c.id
    JOIN images i ON g.image_id = i.id
    JOIN prices pr ON g.pricing_id = pr.id
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("🔥 Error fetching gyms:", err);
      return res.status(500).json({ error: err });
    }

    results.forEach((gym) => {
      if (gym.image) {
        gym.image = `https://afstudeerproject-pgm-aminakha.onrender.com${gym.image}`;
      }
    });

    res.json(results);
  });
});

/* ============================================
 ✅ API: Upload Gym Image
=============================================== */
app.post("/upload/gym", upload.single("gymImage"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "❌ No file uploaded" });
  }
  
  const filePath = `/uploads/${req.file.filename}`;
  res.json({ filePath });
});

/* ============================================
 ✅ API: Fetch Gym by ID
=============================================== */
app.get("/gyms/:id", (req, res) => {
  const gymId = req.params.id;
  const sql = `
    SELECT 
      g.id, g.name, g.city, g.rating, g.opening_hours, g.address, g.personal_trainer, 
      p.name AS province, 
      c.name AS category,
      i.image_url AS image,
      pr.bundle_name AS pricing_bundle, pr.price
    FROM gyms g
    JOIN provinces p ON g.province_id = p.id
    JOIN categories c ON g.category_id = c.id
    JOIN images i ON g.image_id = i.id
    JOIN prices pr ON g.pricing_id = pr.id
    WHERE g.id = ?
  `;

  db.query(sql, [gymId], (err, results) => {
    if (err) {
      console.error("🔥 Error fetching gym:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Gym not found" });
    }

    const gym = results[0];
    if (gym.image) {
      gym.image = `https://afstudeerproject-pgm-aminakha.onrender.com${gym.image}`;
    }

    res.json(gym);
  });
});

/* ============================================
 ✅ Start Server
=============================================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
