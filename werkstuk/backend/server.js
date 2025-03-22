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
if (!SECRET_KEY) {
  console.error("🔥 ERROR: SECRET_KEY is missing! Add it to your .env file.");
  process.exit(1); // Stop the server if missing
}
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const app = express();
app.use(cookieParser()); // ✅ Enable cookie parsing

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

app.use(cors({
  origin: ["http://localhost:4200", "https://pgm-2425-atwork-4.github.io","http://localhost:4200/login"], // ✅ Allow frontend
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // ✅ Allow cookies & authentication headers
}));

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
const verifyToken = (req, res, next) => {
  let token = req.cookies.auth_token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
    req.user = user;
    next();
  });
};
app.use(cors({
  origin: ["http://localhost:4200", "https://pgm-2425-atwork-4.github.io"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // ✅ Allow sending cookies
}));

// ✅ Manually set CORS Headers for Every Response
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200); // ✅ Handle preflight requests
  }
  next();
});
/* ============================================
 ✅ API: User Login (Check Hashed Password)
=============================================== */
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT id, username, firstname, lastname, email, birthday, profile_image, role, password FROM users WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error("🔥 Error fetching user:", err);
      return res.status(500).json({ error: err });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "❌ User not found" });
    }

    const user = results[0];

    // ✅ Compare entered password with hashed password from database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "❌ Incorrect password" });
    }

    try {
      if (!SECRET_KEY) {
        throw new Error("SECRET_KEY is missing from environment variables.");
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        SECRET_KEY,
        { expiresIn: "4h" } // Token expires in 2 hours
      );

      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 4 * 60 * 60 * 1000, // 2 hours
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
        },
        token,
      });

    } catch (error) {
      console.error("🔥 Error creating JWT:", error);
      res.status(500).json({ error: "Server error during authentication." });
    }
  });
});

app.post("/save-gym", verifyToken, (req, res) => {
  const { userId, gymId } = req.body;

  if (!userId || !gymId) {
    return res.status(400).json({ error: "Missing user ID or gym ID" });
  }

  const sql = "INSERT INTO saved_gyms (user_id, gym_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE gym_id = gym_id";
  db.query(sql, [userId, gymId], (err, result) => {
    if (err) {
      console.error("🔥 Error saving gym:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ message: "✅ Gym saved successfully!" });
  });
});
app.post("/logout", (req, res) => {
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
  });

  res.json({ message: "✅ Logged out successfully!" });
});

app.get("/auth/user", verifyToken, (req, res) => {
  const sql = "SELECT id, username, email, profile_image,role FROM users WHERE id = ?";
  
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
app.get("/saved-gyms/:userId", verifyToken, (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT g.id, g.name, g.city, g.rating, g.opening_hours, g.address, g.logo,
      p.name AS province, c.name AS category,
      pr.bundle_name AS pricing_bundle, pr.price,
            pres.name AS pressure,

      GROUP_CONCAT(i.image_url) AS images
    FROM saved_gyms sg
    JOIN gyms g ON sg.gym_id = g.id
    LEFT JOIN provinces p ON g.province_id = p.id
    LEFT JOIN categories c ON g.category_id = c.id
    LEFT JOIN prices pr ON g.pricing_id = pr.id
    LEFT JOIN images i ON g.id = i.gym_id
    LEFT JOIN pressures pres ON g.pressure_id = pres.id
    WHERE sg.user_id = ?
    GROUP BY g.id;
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });

    results.forEach(gym => {
      gym.images = gym.images ? gym.images.split(",") : [];
    });

    res.json(results);
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
app.put("/users/:id", verifyToken, upload.single('profileImage'), async (req, res) => {
  const userId = req.params.id;
  const { username, firstname, lastname, email, password, birthday } = req.body;

  // Ensure that new fields (password, etc.) are valid
  if (!username || !firstname || !lastname || !email || !birthday) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // If password is provided, hash it
  let hashedPassword = password ? await bcrypt.hash(password, 10) : null;
  const profileImage = req.file ? req.file.path : null;

  let updateQuery = "UPDATE users SET username = ?, firstname = ?, lastname = ?, email = ?, birthday = ?";
  let values = [username, firstname, lastname, email, birthday];

  if (hashedPassword) {
    updateQuery += ", password = ?";
    values.push(hashedPassword);
  }

  if (profileImage) {
    updateQuery += ", profile_image = ?";
    values.push(profileImage);
  }

  updateQuery += " WHERE id = ?";

  db.query(updateQuery, [...values, userId], (err, result) => {
    if (err) {
      console.error("🔥 Error updating user:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json({ message: "✅ Profile updated successfully!" });
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

// Fetch comments for a specific gym
// Fetch comments for a specific gym
app.get("/comments/:gymId", (req, res) => {
  const gymId = req.params.gymId;
  const sql = `
    SELECT 
      c.id, c.user_id, c.gym_id, c.comment_text, c.created_at, c.title, c.likes,
      u.username, u.profile_image
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.gym_id = ?
  `;
  
  db.query(sql, [gymId], (err, results) => {
    if (err) {
      console.error("🔥 Error fetching comments:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "No comments available for this gym" });
    }

    res.json(results); // Send the comments along with the user data
  });
});
// POST route to add a comment
app.post("/comments", verifyToken, (req, res) => {
  const { gymId, commentText, title } = req.body;
  const userId = req.user.id; // Extract user ID from the token

  const sql = "INSERT INTO comments (user_id, gym_id, comment_text, title) VALUES (?, ?, ?, ?)";
  const values = [userId, gymId, commentText, title];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("🔥 Error adding comment:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(201).json({
      id: result.insertId,
      user_id: userId,
      gym_id: gymId,
      comment_text: commentText,
      title: title,
    });
  });
});
app.post('/comments/like', (req, res) => {
  const { commentId, userId } = req.body;
  
  if (!commentId || !userId) {
    return res.status(400).json({ error: "Missing commentId or userId" });
  }

  // Check if the user already liked the comment
  const checkLikeQuery = `SELECT * FROM likes WHERE comment_id = ? AND user_id = ?`;
  db.query(checkLikeQuery, [commentId, userId], (err, results) => {
    if (err) {
      console.error('Error checking like status:', err);
      return res.status(500).json({ error: 'Error checking like status' });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: 'You have already liked this comment' });
    }

    // Insert a new like
    const insertLikeQuery = `INSERT INTO likes (comment_id, user_id) VALUES (?, ?)`;
    db.query(insertLikeQuery, [commentId, userId], (err, result) => {
      if (err) {
        console.error('Error inserting like:', err);
        return res.status(500).json({ error: 'Error liking comment' });
      }

      // Update the likes count and liked_by_users field in the comments table
      const updateCommentQuery = `
        UPDATE comments 
        SET likes = likes + 1, liked_by_users = CONCAT(IFNULL(liked_by_users, ''), ?, ',') 
        WHERE id = ?`;
      db.query(updateCommentQuery, [userId, commentId], (err, result) => {
        if (err) {
          console.error('Error updating comment:', err);
          return res.status(500).json({ error: 'Error updating comment' });
        }

        res.status(200).json({ message: 'Comment liked successfully' });
      });
    });
  });
});
app.post("/add-gym", upload.fields([{ name: "logo", maxCount: 1 }, { name: "images", maxCount: 5 }]), async (req, res) => {
  try {
      const { name, city, rating, opening_hours, address, personal_trainer, pressure_id, category_id, pricing_id, province_id, email, phone, website } = req.body;

      // ✅ Upload Logo to Cloudinary
      const logoUrl = req.files["logo"] ? req.files["logo"][0].path : null;

      // ✅ Upload Multiple Images to Cloudinary
      const imageUrls = req.files["images"] ? req.files["images"].map(file => file.path) : [];

      if (!name || !city || !rating || !opening_hours || !address || !category_id || !pricing_id || !province_id) {
          return res.status(400).json({ error: "❌ Missing required fields" });
      }

      console.log("📸 Logo URL:", logoUrl);
      console.log("📷 Gallery Image URLs:", imageUrls);

      // ✅ Insert Gym Data into `gyms` Table
      const sql = `
          INSERT INTO gyms (name, city, rating, opening_hours, address, personal_trainer, pressure_id, category_id, pricing_id, province_id, logo, email, phone, website)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [name, city, rating, opening_hours, address, personal_trainer, pressure_id, category_id, pricing_id, province_id, logoUrl, email, phone, website];

      db.query(sql, values, (err, result) => {
          if (err) {
              console.error("🔥 Database Insert Error:", err);
              return res.status(500).json({ error: "Database error" });
          }

          const gymId = result.insertId;

          // ✅ Insert Image URLs into `images` Table
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
      g.logo, g.email, g.phone, g.website,
      p.name AS province, 
      c.name AS category,
      pr.description AS pricing_bundle, pr.price,
      pres.name AS pressure,
      GROUP_CONCAT(i.image_url) AS images
    FROM gyms g
    LEFT JOIN provinces p ON g.province_id = p.id
    LEFT JOIN categories c ON g.category_id = c.id
    LEFT JOIN prices pr ON g.pricing_id = pr.id
    LEFT JOIN images i ON g.id = i.gym_id 
        LEFT JOIN pressures pres ON g.pressure_id = pres.id  

    GROUP BY g.id; 
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
app.get("/prices", (req, res) => {
  const sql = "SELECT * FROM prices";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("🔥 Error fetching prices:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

app.get("/gyms/:id", (req, res) => {
  const gymId = req.params.id;  // Extract gym ID from the URL

  const sql = `
    SELECT 
      g.id, g.name, g.city, g.rating, g.opening_hours, g.address, g.personal_trainer, 
      g.logo, g.email, g.phone, g.website,
      p.name AS province, 
      c.name AS category,
      pr.description AS pricing_bundle, pr.price,
      pres.name AS pressure,
      GROUP_CONCAT(i.image_url) AS images
    FROM gyms g
    LEFT JOIN provinces p ON g.province_id = p.id
    LEFT JOIN categories c ON g.category_id = c.id
    LEFT JOIN prices pr ON g.pricing_id = pr.id
    LEFT JOIN images i ON g.id = i.gym_id 
        LEFT JOIN pressures pres ON g.pressure_id = pres.id  
  WHERE g.id = ?
    GROUP BY g.id; 
  `;

  db.query(sql, [gymId], (err, results) => {
    if (err) {
      console.error("🔥 Error fetching gym:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "❌ Gym not found" });
    }

    // Convert image URLs from CSV string to an array
    const gym = results[0];
    gym.images = gym.images ? gym.images.split(",") : [];
    gym.pricing_bundle = gym.pricing_bundle || "No pricing available";
    gym.pricing_price = gym.pricing_price || "N/A";

    res.json(gym);
  });
});

app.get("/saved-gyms", verifyToken, (req, res) => {
  const sql = `
    SELECT g.id, g.name, g.city, g.rating, g.opening_hours, g.address, g.logo,
      p.name AS province, c.name AS category,
      pr.bundle_name AS pricing_bundle, pr.price,
                  pres.name AS pressure,  

      GROUP_CONCAT(i.image_url) AS images
    FROM saved_gyms sg
    JOIN gyms g ON sg.gym_id = g.id
    LEFT JOIN provinces p ON g.province_id = p.id
    LEFT JOIN categories c ON g.category_id = c.id
    LEFT JOIN prices pr ON g.pricing_id = pr.id
    LEFT JOIN images i ON g.id = i.gym_id
            LEFT JOIN pressures pres ON g.pressure_id = pres.id 

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
  const { name, city, rating, category_id, opening_hours, address, personal_trainer, pricing_id, province_id, admin_id, description,email,phone,website } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: "❌ No image uploaded!" });
  }

  const imageUrl = req.file.path; // ✅ Cloudinary Image URL

  const sql = `
    INSERT INTO gyms (name, city, rating, category_id, opening_hours, address, personal_trainer, pricing_id, province_id, image_url, admin_id, description,email,phone,website )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?)
  `;
  
  const values = [name, city, rating, category_id, opening_hours, address, personal_trainer, pricing_id, province_id, imageUrl, admin_id, description,email,phone,website ];

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
