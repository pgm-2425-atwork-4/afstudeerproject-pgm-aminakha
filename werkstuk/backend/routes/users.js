const express = require("express");
const { verifyToken } = require("../middlewares/auth");
const { upload } = require("../middlewares/multerConfig");
const { db } = require("../config/db");
const router = express.Router();

router.get("/:id", (req, res) => {
    const sql = "SELECT id, username, email, profile_image, firstname, lastname, birthday FROM users WHERE id = ?";
    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (!results.length) return res.status(404).json({ error: "User not found" });

        const user = results[0];
        user.profile_image = user.profile_image || "https://res.cloudinary.com/placeholder/default-user.png";
        res.json(user);
    });
});
router.put("/:id", verifyToken, upload.single("profileImage"), async (req, res) => {
    const { username, firstname, lastname, email, password, birthday } = req.body;
    const userId = req.params.id;
    const profileImage = req.file ? req.file.path : null;
    const formattedBirthday = new Date(birthday).toISOString().split('T')[0];
    
    if (!username || !firstname || !lastname || !email || !birthday) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    let hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    let query = "UPDATE users SET username = ?, firstname = ?, lastname = ?, email = ?, birthday = ?";
    const values = [username, firstname, lastname, email, formattedBirthday];
    
    if (hashedPassword) {
        query += ", password = ?";
        values.push(hashedPassword);
    }
    
    if (profileImage) {
        query += ", profile_image = ?";
        values.push(profileImage);
    }
    
    query += " WHERE id = ?";
    values.push(userId);
    
    db.query(query, values, (err) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json({ message: "✅ Profile updated successfully!" });
    });
});
router.delete("/saved-exercises/:userId/:exerciseId", verifyToken, (req, res) => {
    const { userId, exerciseId } = req.params;
    const sql = "DELETE FROM saved_exercises WHERE user_id = ? AND exercise_id = ?";
    db.query(sql, [userId, exerciseId], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (result.affectedRows === 0) return res.status(404).json({ error: "Saved exercise not found" });
        res.json({ message: "Saved exercise deleted successfully!" });
    });
});

router.post('/save-exercise', verifyToken, (req, res) => {
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
router.post("/upload/profile", upload.single("profileImage"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "❌ No file uploaded" });
    const filePath = `/uploads/${req.file.filename}`;
    res.json({ filePath });
});

module.exports = router;
