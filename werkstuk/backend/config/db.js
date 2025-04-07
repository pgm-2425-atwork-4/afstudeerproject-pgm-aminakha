const mysql = require("mysql2");

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

db.getConnection((err, conn) => {
  if (err) console.error("🔥 MySQL Connection Error:", err);
  else {
    console.log("✅ Connected to MySQL!");
    conn.release();
  }
});

module.exports = { db };
