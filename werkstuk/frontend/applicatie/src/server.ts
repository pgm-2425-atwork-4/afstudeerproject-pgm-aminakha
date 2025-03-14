require('dotenv').config(); // Load environment variables

import express, { Request, Response } from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import bcrypt from "bcrypt";
import mysql, { RowDataPacket } from "mysql2"; // ✅ Ensure mysql2 is installed

const app = express();

// ✅ Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ MySQL Database Connection (💡 FIXED `db`)
const db = mysql.createPool({
  host: process.env["MYSQL_HOST"],
  user: process.env["MYSQL_USER"],
  password: process.env["MYSQL_PASSWORD"],
  database: process.env["MYSQL_DATABASE"],
  port: Number(process.env["MYSQL_PORT"]), // ✅ Corrected
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("🔥 MySQL Connection Error:", err);
  } else {
    console.log("✅ Connected to MySQL!");
    connection?.release(); // ✅ Safe release using optional chaining
  }
});


// ✅ Health Check Endpoints
app.get('/', (req: Request, res: Response) => res.status(200).send("🚀 Backend is running!"));
app.get('/ping', (req: Request, res: Response) => res.json({ message: "✅ Backend is alive!" }));

/* ============================================
 ✅ API: Fetch All Users (💡 FIXED `db`)
=============================================== */
app.get("/users", (req: Request, res: Response) => {
  const sql = "SELECT id, username, firstname, lastname, email, birthday, profile_image FROM users";

  db.query(sql, (err: mysql.QueryError | null, results: any) => {
    if (err) {
      console.error("🔥 Error fetching users:", err);
      return res.status(500).json({ error: "Database error" }); // ✅ Added return statement
    }
    return res.json(results); // ✅ Ensure all paths return a value
  });
});

/* ============================================
 ✅ API: Fetch Single User (By ID)
=============================================== */
app.get("/users/:id", (req: Request, res: Response) => {
  const userId = req.params["id"]; // ✅ Fix parameter access

  const sql = "SELECT * FROM users WHERE id = ?";

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("🔥 Error fetching user:", err);
      return res.status(500).json({ error: "Database error" });
    }

    const data = results as RowDataPacket[]; // ✅ Explicitly cast to RowDataPacket[]

    if (data.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(data[0]); // ✅ Return the first user
  });
});
/* ============================================
 ✅ Start Server
=============================================== */
const PORT = Number(process.env["PORT"]) || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
