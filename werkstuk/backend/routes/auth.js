// routes/auth.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { upload } = require("../middlewares/multerConfig");
const { db } = require("../config/db");
const { verifyToken } = require("../middlewares/auth");

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;

router.post("/register", upload.single("profileImage"), async (req, res) => {
  try {
    const { username, firstname, lastname, email, password, birthday } = req.body;
    const profileImage = req.file ? req.file.path : null;

    if (!username || !email || !password || !birthday) {
      return res.status(400).json({ error: "❌ Missing required fields" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users 
      (username, firstname, lastname, email, password, birthday, profile_image)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
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

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT id, username, firstname, lastname, email, password, profile_image, role FROM users WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error("🔥 Error fetching user:", err);
      return res.status(500).json({ error: err });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "❌ User not found" });
    }

    const user = results[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "❌ Incorrect password" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, profile_image: user.profile_image },
      SECRET_KEY,
      { expiresIn: "4h" }
    );

    res.cookie("auth_token", token, { httpOnly: true, secure: false });
    res.json({ message: "✅ Login successful!", token });
  });
});

router.post("/logout", (req, res) => {
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
  });
  res.json({ message: "✅ Logged out successfully!" });
});

router.get("/user", verifyToken, (req, res) => {
  const sql = "SELECT id, username, email, profile_image, role FROM users WHERE id = ?";
  db.query(sql, [req.user.id], (err, results) => {
    if (err) {
      console.error("🔥 Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(results[0]);
  });
});

router.get('/email-exists', async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Email is verplicht' });
  }

  try {
    const result = await db.execute('SELECT 1 FROM users WHERE email = ?', [email]);
    const rows = result[0];

    const exists = rows.length > 0;
    res.json({ exists });
  } catch (err) {
    console.error('❌ DB fout:', err);
    res.status(500).json({ error: 'Serverfout' });
  }
});

module.exports = router;
