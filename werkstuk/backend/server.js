require('dotenv').config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const app = express();

// Import routes
const authRoutes = require("./routes/auth");
const gymRoutes = require("./routes/gyms");
const userRoutes = require("./routes/users");
const categoryRoutes = require("./routes/categories");
const commentRoutes = require("./routes/comments");
const priceRoutes = require("./routes/prices");
const savedGymsRoutes = require("./routes/savedGyms");
const pressureRoutes = require("./routes/pressures");
const provinceRoutes = require("./routes/provinces");
const gymImagesRoutes = require("./routes/gymImages");
const exerciseCategories = require("./routes/exercises");
// Init upload dir (if using local uploads too)
const { initUploadDir } = require("./utils/initUploadDir");
initUploadDir();

// Middleware
const corsOptions = {
  origin: [
    "http://localhost:4200",
    "https://pgm-2425-atwork-4.github.io"
  ],
  credentials: true
};

app.use(cors(corsOptions));             // 🟢 Zet CORS als eerste
app.options('*', cors(corsOptions));    // 🟢 Laat preflight toe

app.use(cookieParser());                // 🟡 Daarna pas cookieParser
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, "uploads/")));

// Health check routes
app.get('/', (req, res) => res.send("🚀 Backend is running!"));
app.get('/ping', (req, res) => res.json({ message: "✅ Backend is alive!" }));

// Use routes
app.use("/auth", authRoutes);
app.use("/gyms", gymRoutes);
app.use("/users", userRoutes);
app.use("/categories", categoryRoutes);
app.use("/comments", commentRoutes);
app.use("/prices", priceRoutes);
app.use("/pressures", pressureRoutes);
app.use("/saved-gyms", savedGymsRoutes);

app.use('/provinces', provinceRoutes);
app.use('/sporthallen', gymImagesRoutes);
app.use('/exercises', exerciseCategories)

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
