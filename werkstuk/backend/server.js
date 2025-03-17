require('dotenv').config(); // Load environment variables
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
 
const app = express();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
// ✅ Set up Cloudinary Storage for Uploads
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "user_uploads", // This should create the folder
    format: async (req, file) => "png", // Convert images to PNG
    public_id: (req, file) => Date.now() + "-" + file.originalname.replace(/\s/g, "_"), // Unique filename
  },
});
// ✅ Cloudinary Storage for Gym Images
const gymStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "gym_images", // Store in "gym_images" folder
    format: async (req, file) => "png", // Convert images to PNG
    public_id: (req, file) => Date.now() + "-" + file.originalname.replace(/\s/g, "_"), // Unique filename
  },
});
// ✅ Ensure "uploads" directory exists
const uploadDir = path.join(__dirname, "uploads/");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// ✅ Middleware
app.use(cors({
  origin: ["https://pgm-2425-atwork-4.github.io", "http://localhost:4200"], // ✅ Allow both GitHub Pages & Localhost
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(uploadDir)); // ✅ Serve images correctly

// ✅ Check if server is running
app.get('/', (req, res) => {
  res.status(200).send("🚀 Backend is running!");
});

// ✅ Test Backend
app.get('/ping', (req, res) => {
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

const upload = multer({ storage });

/* ============================================
 ✅ API: Register User with Profile Image Upload
=============================================== */
app.post("/register", upload.single("profileImage"), async (req, res) => {
  try {
    const { username, firstname, lastname, email, password, birthday } = req.body;
    
    // ✅ Ensure Cloudinary returns a valid URL
    const profileImage = req.file ? req.file.path : null;

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

  const sql = "SELECT id, username, firstname, lastname, email, birthday, profile_image, role FROM users WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error("🔥 Error fetching user:", err);
      return res.status(500).json({ error: err });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "❌ User not found" });
    }

    const user = results[0];

    res.json({
      message: "✅ Login successful!",
      user: {
        id: user.id,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        birthday: user.birthday,
        role: user.role,
        profile_image: user.profile_image || null,
      },
    });
  });
});

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

app.get("/users/:id", (req, res) => {
  const userId = req.params.id;
  const sql = "SELECT id, username, email, profile_image, firstname, lastname, birthday FROM users WHERE id = ?";

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("🔥 Error fetching user:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      console.log("❌ User not found:", userId);
      return res.status(404).json({ error: "User not found" });
    }

    const user = results[0];

    // ✅ Ensure profile_image URL is correct (Cloudinary or Default)
    user.profile_image = user.profile_image
      ? user.profile_image
      : "https://res.cloudinary.com/dwkf8avz2/image/upload/vXXXXXXXX/default-user.png"; // Default image

    console.log("✅ Returning user data:", user);
    res.json(user); // ✅ Send full user object
  });
});
const logoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "gym_logos", // Gym logos stored here
    format: async () => "png",
    public_id: (req, file) => Date.now() + "-" + file.originalname.replace(/\s/g, "_"),
  },
});

const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "gym_images", // Gym additional images stored here
    format: async () => "jpg",
    public_id: (req, file) => Date.now() + "-" + file.originalname.replace(/\s/g, "_"),
  },
});

const uploadLogo = multer({ storage: logoStorage }).single("logo"); // Single file
const uploadImages = multer({ storage: imageStorage }).array("images", 5); // Multiple files (Max: 5)


const gymUpload = multer({ storage: gymStorage });
app.post("/upload-gym-image", gymUpload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "❌ No file uploaded!" });
  }

  const imageUrl = req.file.path; // ✅ Get Cloudinary URL
  res.status(201).json({ message: "✅ Gym Image Uploaded!", imageUrl });
});
app.post("/add-gym", (req, res) => {
  uploadLogo(req, res, (err) => {
      if (err) {
          console.error("🔥 Logo Upload Error:", err);
          return res.status(400).json({ error: "Logo upload failed", details: err.message });
      }

      const logoUrl = req.file ? req.file.path : null; // ✅ Cloudinary URL for logo

      uploadImages(req, res, (err) => {
          if (err) {
              console.error("🔥 Images Upload Error:", err);
              return res.status(400).json({ error: "Images upload failed", details: err.message });
          }

          const { name, city, rating, opening_hours, address, personal_trainer } = req.body;
          const imageUrls = req.files ? req.files.map(file => file.path) : []; // ✅ Uploaded images

          if (!name || !city || !rating || !opening_hours || !address) {
              return res.status(400).json({ error: "❌ Missing required fields" });
          }

          console.log("📸 Logo URL:", logoUrl);
          console.log("📷 Image URLs:", imageUrls);

          const sql = `
              INSERT INTO gyms (name, city, rating, opening_hours, address, personal_trainer, logo)
              VALUES (?, ?, ?, ?, ?, ?, ?)
          `;
          const values = [name, city, rating, opening_hours, address, personal_trainer, logoUrl];

          db.query(sql, values, (err, result) => {
              if (err) {
                  console.error("🔥 Database Insert Error:", err);
                  return res.status(500).json({ error: "Database error", details: err.message });
              }

              const gymId = result.insertId;

              if (imageUrls.length > 0) {
                  const imageInsertSql = "INSERT INTO images (gym_id, image_url) VALUES ?";
                  const imageValues = imageUrls.map(url => [gymId, url]);

                  db.query(imageInsertSql, [imageValues], (imageErr, imageResult) => {
                      if (imageErr) {
                          console.error("🔥 Image Insert Error:", imageErr);
                          return res.status(500).json({ error: "Image insert failed", details: imageErr.message });
                      }
                      res.status(201).json({ message: "✅ Gym Added!", gymId, logo: logoUrl, images: imageUrls });
                  });
              } else {
                  res.status(201).json({ message: "✅ Gym Added!", gymId, logo: logoUrl });
              }
          });
      });
  });
});

/* ============================================
 ✅ API: Fetch All Gyms
=============================================== */
app.get("/gyms", (req, res) => {
  const sql = `
    SELECT 
      g.id, g.name, g.city, g.rating, g.opening_hours, g.address, g.personal_trainer, g.logo, 
      p.name AS province, 
      c.name AS category,
      pr.bundle_name AS pricing_bundle, pr.price
    FROM gyms g
    LEFT JOIN provinces p ON g.province_id = p.id
    LEFT JOIN categories c ON g.category_id = c.id
    LEFT JOIN prices pr ON g.pricing_id = pr.id;
  `;

  db.query(sql, (err, gyms) => {
    if (err) {
      console.error("🔥 Database Query Error:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }

    // ✅ Fetch all images separately
    const gymIds = gyms.map(g => g.id);
    if (gymIds.length === 0) {
      return res.json(gyms); // ✅ No gyms found, return empty array
    }

    const imageQuery = "SELECT gym_id, image_url FROM images WHERE gym_id IN (?)";
    db.query(imageQuery, [gymIds], (imgErr, images) => {
      if (imgErr) {
        console.error("🔥 Error fetching gym images:", imgErr);
        return res.status(500).json({ error: "Database error" });
      }

      // ✅ Attach images to gyms
      const gymMap = {};
      gyms.forEach(gym => {
        gymMap[gym.id] = { ...gym, images: [] };
      });

      images.forEach(img => {
        if (gymMap[img.gym_id]) {
          gymMap[img.gym_id].images.push(img.image_url);
        }
      });

      res.json(Object.values(gymMap));
    });
  });
});

const adminUpload = multer({ storage: gymStorage });

app.post("/admin/upload-gym-image", adminUpload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "❌ No file uploaded!" });
  }

  const imageUrl = req.file.path; // ✅ Get Cloudinary URL
  res.status(201).json({ message: "✅ Gym Image Uploaded!", imageUrl });
});
app.post("/admin/add-gym", adminUpload.single("image"), (req, res) => {
  const { name, city, rating, category_id, opening_hours, address, personal_trainer, pricing_id, province_id, admin_id, description } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: "❌ No image uploaded!" });
  }

  const imageUrl = req.file.path; // ✅ Cloudinary Image URL

  const sql = `
    INSERT INTO gyms (name, city, rating, category_id, opening_hours, address, personal_trainer, pricing_id, province_id, image_url, admin_id, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const values = [name, city, rating, category_id, opening_hours, address, personal_trainer, pricing_id, province_id, imageUrl, admin_id, description];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("🔥 Error adding gym:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(201).json({ message: "✅ Gym Added!", gymId: result.insertId, imageUrl });
  });
});
app.get("/admin/gyms/:adminId", (req, res) => {
  const adminId = req.params.adminId;

  const sql = `
    SELECT 
      g.id, g.name, g.city, g.rating, g.opening_hours, g.address, g.personal_trainer, 
      p.name AS province, 
      c.name AS category,
      g.image_url AS image,
      pr.bundle_name AS pricing_bundle, pr.price
    FROM gyms g
    JOIN provinces p ON g.province_id = p.id
    JOIN categories c ON g.category_id = c.id
    LEFT JOIN prices pr ON g.pricing_id = pr.id
    WHERE g.admin_id = ?
  `;

  db.query(sql, [adminId], (err, results) => {
    if (err) {
      console.error("🔥 Error fetching admin gyms:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

/* ============================================
 ✅ API: Upload Image (Profile & Categories)
=============================================== */
app.post("/upload/profile", upload.single("profileImage"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "❌ No file uploaded" });
  }

  console.log("✅ File uploaded:", req.file); // 🐛 Debugging

  const filePath = `/uploads/${req.file.filename}`;
  res.json({ filePath });
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
