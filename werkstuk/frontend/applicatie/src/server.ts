require("dotenv").config(); // Load environment variables

import express, { Request, Response } from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import bcrypt from "bcrypt";
import mysql, { RowDataPacket } from "mysql2"; // ✅ Ensure mysql2 is installed
import { fileURLToPath } from "url";

const app = express();

// ✅ Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Middleware
app.use(cors({
  origin: ["http://localhost:4200", "https://pgm-2425-atwork-4.github.io","http://localhost:4200/login"], 
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, 
}));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ MySQL Database Connection
const db = mysql.createPool({
  host: process.env["MYSQL_HOST"],
  user: process.env["MYSQL_USER"],
  password: process.env["MYSQL_PASSWORD"],
  database: process.env["MYSQL_DATABASE"],
  port: Number(process.env["MYSQL_PORT"]),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
console.log("🔗 Connecting to MySQL..." + process.env["MYSQL_HOST"]);

db.getConnection((err, connection) => {
  if (err) {
    console.error("🔥 MySQL Connection Error:", err);
  } else {
    console.log("✅ Connected to MySQL!");
    connection?.release(); // ✅ Safe release
  }
});

// ✅ Health Check Endpoints
app.get("/", (req: Request, res: Response) =>
  res.status(200).send("🚀 Backend is running!")
);
app.get("/ping", (req: Request, res: Response) =>
  res.json({ message: "✅ Backend is alive!" })
);

/* ============================================
 ✅ API: Fetch All User IDs (For Prerendering)
=============================================== */
app.get("/users", (req: Request, res: Response) => {
  const sql = "SELECT id FROM users"; // ✅ Fetch only user IDs

  db.query(sql, (err: mysql.QueryError | null, results: RowDataPacket[]) => {
    if (err) {
        console.error("🔥 Error fetching user IDs:", err);
        return res.status(500).json({ error: "Database error" }); // ✅ Ensure return
    }

    if (!results || results.length === 0) {
        return res.status(404).json({ error: "No users found" }); // ✅ Ensure return
    }

    return res.json(results); // ✅ Ensures function always returns
  });
});

/* ============================================
 ✅ API: Fetch Single User (By ID)
=============================================== */
app.get("/users/:id", (req: Request, res: Response) => {
  const userId = req.params["id"]; // ✅ Correct way to access route parameters
  console.log(`🔍 Fetching user with ID: ${userId}`);

  const sql = "SELECT * FROM users WHERE id = ?";

  db.query(sql, [userId], (err, results: RowDataPacket[]) => {
    if (err) {
      console.error("🔥 Error fetching user:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(results[0]); // ✅ Return user data
  });
});

/* ============================================
 ✅ Function: Fetch User IDs for Prerendering
=============================================== */
export function fetchUserIds(): Promise<{ id: string }[]> {
  return new Promise((resolve, reject) => {
      const sql = "SELECT id FROM users"; // ✅ Fetch only user IDs

      db.query(sql, (err: mysql.QueryError | null, results: RowDataPacket[]) => {
          if (err) {
              console.error("🔥 Error fetching user IDs:", err);
              return reject(err); // ✅ Ensures function returns a value
          }

          // ✅ Convert to expected format `{ id: string }[]`
          const userIds = results.map((user) => ({ id: user["id"].toString() }));
          resolve(userIds);
      });
  });
}

/* ============================================
 ✅ Start Server
=============================================== */
const PORT = process.env["PORT"] || 5000;
console.log("📌 ENV PORT:", PORT);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
