require('dotenv').config(); 
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
  process.exit(1); 
}
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const app = express();
app.use(cookieParser()); 
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "user_uploads", 
    format: async (req, file) => "png", 
    public_id: (req, file) => Date.now() + "-" + file.originalname.replace(/\s/g, "_"), 
  },
});
const gymStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "gym_images", 
    format: async (req, file) => "png", 
    public_id: (req, file) => Date.now() + "-" + file.originalname.replace(/\s/g, "_"), 
  },
});

const uploadDir = path.join(__dirname, "uploads/");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'exercise_videos',  
    format: async (req, file) => 'mp4', 
    public_id: (req, file) => Date.now() + "-" + file.originalname.replace(/\s/g, "_")
  },
});
const uploadFields = multer({
  storage: videoStorage
}).fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]);

const upload = multer({ storage });
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://localhost:4200",
      "https://pgm-2425-atwork-4.github.io",
      "http://localhost:4200/login"
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("❌ Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));


app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://localhost:4200",
      "https://pgm-2425-atwork-4.github.io",
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("❌ Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(uploadDir)); 

app.get('/', (req, res) => {
  res.status(200).send("🚀 Backend is running!");
});

app.get('/ping', (req, res) => {
  res.json({ message: "✅ Backend is alive!" });
});

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




app.post("/register", upload.single("profileImage"), async (req, res) => {
  try {
    const { username, firstname, lastname, email, password, birthday } = req.body;
    
    const profileImage = req.file ? req.file.path : null;

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
const verifyToken = (req, res, next) => {
  let token = req.cookies.auth_token || req.headers['authorization']?.split(" ")[1]; 

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


app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT id, username, firstname, lastname, email, password FROM users WHERE email = ?";
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
      { id: user.id, username: user.username, role: user.role,profile_image:user.profile_image },
      process.env.SECRET_KEY,
      { expiresIn: "4h" }
    );

    res.cookie("auth_token", token, { httpOnly: true, secure: false });
    res.json({ message: "✅ Login successful!", token }); 
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

    user.profile_image = user.profile_image
      ? user.profile_image
      : "https://res.cloudinary.com/dwkf8avz2/image/upload/vXXXXXXXX/default-user.png";

    console.log("✅ Returning user data:", user);
    res.json(user); 
  });
});
app.put("/users/:id", verifyToken, upload.single('profileImage'), async (req, res) => {
  const userId = req.params.id;
  const { username, firstname, lastname, email, password, birthday } = req.body;
  const formattedBirthday = new Date(birthday).toISOString().split('T')[0]; 

  if (!username || !firstname || !lastname || !email || !birthday) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  let hashedPassword = password ? await bcrypt.hash(password, 10) : null;
  const profileImage = req.file ? req.file.path : null;

  let updateQuery = "UPDATE users SET username = ?, firstname = ?, lastname = ?, email = ?, birthday = ?";
  let values = [username, firstname, lastname, email, formattedBirthday];

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
    folder: "gym_logos", 
    format: async () => "png",
    public_id: (req, file) => Date.now() + "-" + file.originalname.replace(/\s/g, "_"),
  },
});

const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "gym_images", 
    format: async () => "jpg",
    public_id: (req, file) => Date.now() + "-" + file.originalname.replace(/\s/g, "_"),
  },
});
const uploadImage = multer({ storage: imageStorage }).single("image"); 

const uploadLogo = multer({ storage: logoStorage }).single("logo"); 
const uploadImages = multer({ storage: imageStorage }).array("images", 5); 
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

  const imageUrl = req.file.path; 
  res.status(201).json({ message: "✅ Gym Image Uploaded!", imageUrl });
});


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

    res.json(results);
  });
});
app.post("/comments", verifyToken, (req, res) => {
  const { gymId, commentText, title } = req.body;
  const userId = req.user.id; 

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

  const checkLikeQuery = `SELECT * FROM likes WHERE comment_id = ? AND user_id = ?`;
  db.query(checkLikeQuery, [commentId, userId], (err, results) => {
    if (err) {
      console.error('Error checking like status:', err);
      return res.status(500).json({ error: 'Error checking like status' });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: 'You have already liked this comment' });
    }

    const insertLikeQuery = `INSERT INTO likes (comment_id, user_id) VALUES (?, ?)`;
    db.query(insertLikeQuery, [commentId, userId], (err, result) => {
      if (err) {
        console.error('Error inserting like:', err);
        return res.status(500).json({ error: 'Error liking comment' });
      }

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
const uploadGymLogo = multer({ storage: logoStorage }); 

app.put("/gyms/:id", verifyToken, uploadGymLogo.single("logo"), (req, res) => {
  const gymId = req.params.id;
  const { name, city, rating, opening_hours, address, email, phone, website } = req.body;
  const logoUrl = req.file ? req.file.path : null;

  if (!name || !city || !rating || !opening_hours || !address) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  let sql = `
    UPDATE gyms SET 
      name = ?, 
      city = ?, 
      rating = ?, 
      opening_hours = ?, 
      address = ?, 
      email = ?, 
      phone = ?, 
      website = ?
  `;
  const values = [name, city, rating, opening_hours, address, email, phone, website];

  if (logoUrl) {
    sql += `, logo = ?`;
    values.push(logoUrl);
  }

  sql += ` WHERE id = ?`;
  values.push(gymId);

  db.query(sql, values, (err) => {
    if (err) {
      console.error("🔥 Error updating gym:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json({ message: "✅ Gym updated successfully!" });
  });
});

app.delete("/gyms/:id", verifyToken, (req, res) => {
  const gymId = req.params.id;

  db.query("DELETE FROM gyms WHERE id = ?", [gymId], (err, result) => {
    if (err) {
      console.error("🔥 Error deleting gym:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Gym not found" });
    }

    res.json({ message: "✅ Gym deleted successfully!" });
  });
});
app.post("/categories", verifyToken, upload.single("image"), (req, res) => {
  const { name } = req.body;
  const imageUrl = req.file ? req.file.path : null;

  if (!name || !imageUrl) {
    return res.status(400).json({ error: "❌ Missing category name or image" });
  }

  const sql = "INSERT INTO categories (name, image_url) VALUES (?, ?)";
  db.query(sql, [name, imageUrl], (err, result) => {
    if (err) {
      console.error("🔥 Error inserting category:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.status(201).json({
      message: "✅ Category added successfully!",
      id: result.insertId,
      name,
      imageUrl
    });
  });
});

app.post("/add-gym", upload.fields([{ name: "logo", maxCount: 1 }, { name: "images", maxCount: 5 }]), async (req, res) => {
  try {
      const { name, city, rating, opening_hours, address, personal_trainer, pressure_id, category_id, pricing_id, province_id, email, phone, website } = req.body;

      const logoUrl = req.files["logo"] ? req.files["logo"][0].path : null;

      const imageUrls = req.files["images"] ? req.files["images"].map(file => file.path) : [];

      if (!name || !city || !rating || !opening_hours || !address || !category_id || !pricing_id || !province_id) {
          return res.status(400).json({ error: "❌ Missing required fields" });
      }

      console.log("📸 Logo URL:", logoUrl);
      console.log("📷 Gallery Image URLs:", imageUrls);

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

    results.forEach(gym => {
      gym.images = gym.images ? gym.images.split(",") : [];
    });

    console.log("✅ Gyms Data:", results); 
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
  const gymId = req.params.id;  

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

app.delete("/saved-gyms/:userId/:gymId", verifyToken, (req, res) => {
  const { userId, gymId } = req.params;

  if (!userId || !gymId) {
    return res.status(400).json({ error: "❌ Missing userId or gymId" });
  }

  const sql = "DELETE FROM saved_gyms WHERE user_id = ? AND gym_id = ?";

  db.query(sql, [userId, gymId], (err, result) => {
    if (err) {
      console.error("🔥 Error deleting saved gym:", err);
      return res.status(500).json({ error: "❌ Error deleting gym" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "❌ Saved gym not found" });
    }

    res.json({ message: "✅ Saved gym deleted successfully!" });
  });
});

const adminUpload = multer({ storage: gymStorage });

app.post("/admin/upload-gym-image", adminUpload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "❌ No file uploaded!" });
  }

  const imageUrl = req.file.path; 
  res.status(201).json({ message: "✅ Gym Image Uploaded!", imageUrl });
});
app.post("/admin/add-gym", adminUpload.single("image"), (req, res) => {
  const { name, city, rating, category_id, opening_hours, address, personal_trainer, pricing_id, province_id, admin_id, description,email,phone,website } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: "❌ No image uploaded!" });
  }

  const imageUrl = req.file.path; 

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
app.put("/categories/:id", verifyToken, upload.single("image"), (req, res) => {
  const categoryId = req.params.id;
  const { name } = req.body;
  const image = req.file ? req.file.path : null; 

  if (!name) {
    return res.status(400).json({ error: "❌ Category name required" });
  }

  let sql = "UPDATE categories SET name = ?";
  const values = [name];

  if (image) {
    sql += ", image_url = ?"; 
    values.push(image);
  }

  sql += " WHERE id = ?";
  values.push(categoryId);

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("🔥 Error updating category:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ message: "✅ Category updated successfully!" });
  });
});
app.delete("/categories/:id", verifyToken, (req, res) => {
  const categoryId = req.params.id;

  const sql = "DELETE FROM categories WHERE id = ?";
  db.query(sql, [categoryId], (err, result) => {
    if (err) {
      console.error("🔥 Error deleting category:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "❌ Category not found" });
    }

    res.json({ message: "✅ Category deleted successfully!" });
  });
});

app.post("/upload/profile", upload.single("profileImage"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "❌ No file uploaded" });
  }

  console.log("✅ File uploaded:", req.file); 

  const filePath = `/uploads/${req.file.filename}`;
  res.json({ filePath });
});

app.post("/add-exercise-category", verifyToken, (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "❌ Missing category name" });
  }

  const sql = "INSERT INTO exercise_categories (name) VALUES (?)";
  db.query(sql, [name], (err, result) => {
    if (err) {
      console.error("🔥 Error adding category:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(201).json({ message: "✅ Category added successfully!" });
  });
});


app.post("/admin/add-exercise", uploadImage, (req, res) => {
  const { name, exerciseCategory_id, pressure_id, big_description } = req.body;

  const imageUrl = req.file ? req.file.path : null;

  if (!name || !exerciseCategory_id || !pressure_id || !big_description || !imageUrl) {
    return res.status(400).json({ error: "❌ Missing required fields" });
  }

  const sql = `
    INSERT INTO exercises (name, exerciseCategory_id, pressure_id, big_description, image)
    VALUES (?, ?, ?, ?, ?)
  `;

  const values = [name, exerciseCategory_id, pressure_id, big_description, imageUrl];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("🔥 Error adding exercise:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(201).json({ message: "✅ Exercise added successfully!" });
  });
});
app.put("/categories/:id", verifyToken, upload.single("image"), (req, res) => {
  const categoryId = req.params.id;
  const { name } = req.body;
  const image = req.file ? req.file.path : null;

  if (!name) {
    return res.status(400).json({ error: "❌ Category name required" });
  }

  let sql = "UPDATE categories SET name = ?";
  const values = [name];

  if (image) {
    sql += ", image = ?";
    values.push(image);
  }

  sql += " WHERE id = ?";
  values.push(categoryId);

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("🔥 Error updating category:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ message: "✅ Category updated successfully!" });
  });
});

app.delete("/categories/:id", verifyToken, (req, res) => {
  const categoryId = req.params.id;

  const sql = "DELETE FROM categories WHERE id = ?";
  db.query(sql, [categoryId], (err, result) => {
    if (err) {
      console.error("🔥 Error deleting category:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "❌ Category not found" });
    }

    res.json({ message: "✅ Category deleted successfully!" });
  });
});


app.get("/exercise-categories", verifyToken, (req, res) => {
  const sql = "SELECT * FROM exercise_categories"; 

  db.query(sql, (err, results) => {
    if (err) {
      console.error("🔥 Error fetching exercise categories:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(results);
  });
});

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
