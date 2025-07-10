const { db } = require("../config/db");

exports.getPrices = (req, res) => {
  const sql = "SELECT * FROM prices";

  console.log("📥 Executing SQL:", sql); // ✅ log before

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ MySQL Error:", err); // ✅ deeper log
      return res.status(500).json({ error: "Database error", details: err });
    }

    console.log("✅ Price results:", results); // ✅ log output
    res.status(200).json(results);
  });
};