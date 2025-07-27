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
  const { userId } = req.params;

  const sql = `
    SELECT gyms.*
    FROM saved_gyms
    JOIN gyms ON saved_gyms.gym_id = gyms.id
    WHERE saved_gyms.user_id = ?
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("🔥 Error fetching saved gyms:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(result);
  });
});
module.exports = router;