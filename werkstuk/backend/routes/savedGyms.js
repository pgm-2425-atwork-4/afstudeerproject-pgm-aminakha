const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth");
const { db } = require('../config/db'); 

router.delete("/:userId/:gymId", verifyToken, (req, res) => {
    const { userId, gymId } = req.params;

  if (!userId || !gymId) {
    return res.status(400).json({ error: "❌ Missing userId or gymId" });
  }

  const sql = "DELETE FROM saved_gyms WHERE user_id = ? AND gym_id = ?";

  db.query(sql, [userId, gymId], (err, result) => {
    if (err) {
      console.error("🔥 Error deleting saved gym:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "❌ Saved gym not found" });
    }

    res.json({ message: "✅ Saved gym deleted successfully!" });
  });
});

router.get("/:userId", verifyToken, (req, res) => {
  const sql = `
    SELECT  g.*, p.name AS province, c.name AS category, pr.bundle_name AS pricing_bundle, pr.price,
            pres.name AS pressure, GROUP_CONCAT(i.image_url) AS images
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

    db.query(sql, [req.params.userId], (err, results) => {
      if (err) {
        console.error("🔥 Database error in /saved-gyms/:userId:", err.sqlMessage || err.message || err);
        return res.status(500).json({ error: "Database error", details: err.sqlMessage || err.message });
      }        
        results.forEach(gym => {
            gym.images = gym.images ? gym.images.split(",") : [];
        });
    
    res.status(200).json(results);
    });
});
module.exports = router;