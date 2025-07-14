const express = require("express");
const router = express.Router();
const { deleteSavedGym } = require("../controllers/userController"); // or your savedGymsController
const { verifyToken } = require("../middlewares/auth");
const db = require("../config/db"); // Assuming you have a db config file   $

router.delete("/:userId/:gymId", verifyToken, deleteSavedGym);
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

    if (result.length === 0) {
      return res.status(404).json({ message: "No saved gyms found" });
    }

    res.json(result);
  });
});
module.exports = router;