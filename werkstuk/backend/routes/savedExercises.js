const express = require("express");
const { db } = require("../config/db");
const router = express.Router();

router.delete("/users/saved-exercises/:exerciseId", verifyToken, (req, res) => {
    const { userId, exerciseId } = req.params;
    const sql = "DELETE FROM saved_exercises WHERE user_id = ? AND exercise_id = ?";
    db.query(sql, [userId, exerciseId], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (result.affectedRows === 0) return res.status(404).json({ error: "Saved exercise not found" });
        res.json({ message: "Saved exercise deleted successfully!" });
    });
});

