const express = require("express");
const { db } = require("../config/db");
const router = express.Router();

router.delete("/:exerciseId", verifyToken, (req, res) => {
    const { userId, exerciseId } = req.params;
    const sql = "DELETE FROM saved_exercises WHERE user_id = ? AND exercise_id = ?";
    db.query(sql, [userId, exerciseId], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (result.affectedRows === 0) return res.status(404).json({ error: "Saved exercise not found" });
        res.json({ message: "Saved exercise deleted successfully!" });
    });
});

router.post('/', verifyToken, (req, res) => {
    const { userId, exerciseId } = req.body;

    if (!userId || !exerciseId) {
        return res.status(400).json({ error: "Missing userId or exerciseId" });
    }

    const sql = `
        INSERT INTO saved_exercises (user_id, exercise_id)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE exercise_id = exercise_id
    `;

    db.query(sql, [userId, exerciseId], (err) => {
        if (err) {
            console.error("❌ MySQL error:", err);
            return res.status(500).json({ error: "Database error", details: err });
        }
        res.json({ message: "✅ Exercise saved successfully!" });
    });
});
