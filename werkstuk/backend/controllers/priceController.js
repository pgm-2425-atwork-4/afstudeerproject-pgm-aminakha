const { db } = require("../config/db");

exports.getPrices = (req, res) => {
  const sql = "SELECT id, prijsing, description FROM prices";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("🔥 Error fetching prices:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(200).json(results);
  });
};