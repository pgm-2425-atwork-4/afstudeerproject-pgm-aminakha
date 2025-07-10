const { db } = require("../config/db");

// GET pressures
exports.getPressures = (req, res) => {
  const sql = "SELECT id, name FROM pressures";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("🔥 Error fetching pressures:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
};
