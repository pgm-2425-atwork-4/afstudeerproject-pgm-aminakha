const { db } = require("../config/db");

// GET provinces
exports.getProvinces = (req, res) => {
  const sql = "SELECT id, name FROM provinces";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("🔥 Error fetching provinces:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
};