require('dotenv').config(); // Load environment variables
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary").v2;
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const SECRET_KEY = process.env.SECRET_KEY;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const app = express();
app.use(cookieParser()); // ✅ Enable cookie parsing
const verifyToken = (req, res, next) => {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ error: "❌ Unauthorized: No token provided" });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "❌ Invalid token" });
    }
    req.user = user; // ✅ Attach user data to the request
    next(); // ✅ Proceed to the next function
  });
};
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

const corsOptions = {
  origin: "http://localhost:4200", // ✅ Adjust as needed
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // ✅ Allow cookies & authentication headers
};
app.use(cors(corsOptions));

// ✅ Manually Set CORS Headers for Every Response
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:4200");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200); // ✅ Handle preflight
  }
  next();
});
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
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "❌ Incorrect password" });
    }
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      SECRET_KEY,
      { expiresIn: "2h" } // Token expires in 2 hours
    );
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure in production
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
    });
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
      },token
    });
  });
});

app.post("/logout", (req, res) => {
  res.clearCookie("auth_token");
  res.json({ message: "✅ Logged out successfully!" });
});


app.get("/auth/user", verifyToken, (req, res) => {
  const sql = "SELECT id, username, email, profile_image FROM users WHERE id = ?";
  
  db.query(sql, [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });

    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(results[0]);
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
app.get("/pressures", (req, res) => {
  const sql = "SELECT id, name FROM pressures";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("🔥 Error fetching pressures:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

app.get("/pricing", (req, res) => {
  const sql = "SELECT id, bundle_name, price FROM prices";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("🔥 Error fetching pricing:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

app.get("/provinces", (req, res) => {
  const sql = "SELECT id, name FROM provinces";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("🔥 Error fetching provinces:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

const gymUpload = multer({ storage: gymStorage });
app.post("/upload-gym-image", gymUpload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "❌ No file uploaded!" });
  }

  const imageUrl = req.file.path; // ✅ Get Cloudinary URL
  res.status(201).json({ message: "✅ Gym Image Uploaded!", imageUrl });
});
app.post("/add-gym", upload.fields([{ name: "logo", maxCount: 1 }, { name: "images", maxCount: 5 }]), (req, res) => {
  try {
      const { name, city, rating, opening_hours, address, personal_trainer, pressure_id, category_id, pricing_id, province_id } = req.body;

      // ✅ Get logo URL
      const logoUrl = req.files["logo"] ? req.files["logo"][0].path : null;

      // ✅ Get uploaded image URLs
      const imageUrls = req.files["images"] ? req.files["images"].map(file => file.path) : [];

      if (!name || !city || !rating || !opening_hours || !address || !category_id || !pricing_id || !province_id) {
          return res.status(400).json({ error: "❌ Missing required fields" });
      }

      console.log("📸 Logo URL:", logoUrl);
      console.log("📷 Image URLs:", imageUrls);
      console.log("🛠️ Pressure ID:", pressure_id);
      console.log("📂 Category ID:", category_id);
      console.log("💰 Pricing ID:", pricing_id);
      console.log("📍 Province ID:", province_id);

      const sql = `
          INSERT INTO gyms (name, city, rating, opening_hours, address, personal_trainer, pressure_id, category_id, pricing_id, province_id, logo)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [name, city, rating, opening_hours, address, personal_trainer, pressure_id, category_id, pricing_id, province_id, logoUrl];

      db.query(sql, values, (err, result) => {
          if (err) {
              console.error("🔥 Database Insert Error:", err);
              return res.status(500).json({ error: "Database error", details: err.message });
          }

          const gymId = result.insertId;

          // ✅ Insert images into `images` table
          if (imageUrls.length > 0) {
              const imageInsertSql = "INSERT INTO images (gym_id, image_url) VALUES ?";
              const imageValues = imageUrls.map(url => [gymId, url]);

              db.query(imageInsertSql, [imageValues], (imageErr) => {
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
  } catch (error) {
      console.error("🔥 Unexpected Error:", error);
      res.status(500).json({ error: "Server error", details: error.message });
  }
});


/* ============================================
 ✅ API: Fetch All Gyms
=============================================== */
app.get("/gyms", (req, res) => {
  const sql = `
    SELECT 
      g.id, g.name, g.city, g.rating, g.opening_hours, g.address, g.personal_trainer, 
      g.logo, -- ✅ Added gym logo
      p.name AS province, 
      c.name AS category,
      pr.bundle_name AS pricing_bundle, pr.price,
      GROUP_CONCAT(i.image_url) AS images -- ✅ Fetch multiple images
    FROM gyms g
    LEFT JOIN provinces p ON g.province_id = p.id
    LEFT JOIN categories c ON g.category_id = c.id
    LEFT JOIN prices pr ON g.pricing_id = pr.id
    LEFT JOIN images i ON g.id = i.gym_id -- ✅ Get multiple images per gym
    GROUP BY g.id; -- ✅ Group by gym ID to avoid duplicates
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("🔥 Database Query Error:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }

    // ✅ Convert images from CSV string to array
    results.forEach(gym => {
      gym.images = gym.images ? gym.images.split(",") : [];
    });

    console.log("✅ Gyms Data:", results); // 🐛 Debugging
    res.json(results);
  });
});
app.get("/saved-gyms", verifyToken, (req, res) => {
  const sql = `
    SELECT g.id, g.name, g.city, g.rating, g.opening_hours, g.address, g.logo,
      p.name AS province, c.name AS category,
      pr.bundle_name AS pricing_bundle, pr.price,
      GROUP_CONCAT(i.image_url) AS images
    FROM saved_gyms sg
    JOIN gyms g ON sg.gym_id = g.id
    LEFT JOIN provinces p ON g.province_id = p.id
    LEFT JOIN categories c ON g.category_id = c.id
    LEFT JOIN prices pr ON g.pricing_id = pr.id
    LEFT JOIN images i ON g.id = i.gym_id
    WHERE sg.user_id = ?
    GROUP BY g.id;
  `;

  db.query(sql, [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });

    results.forEach(gym => {
      gym.images = gym.images ? gym.images.split(",") : [];
    });

    res.json(results);
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
