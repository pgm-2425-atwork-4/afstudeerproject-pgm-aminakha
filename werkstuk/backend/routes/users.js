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
router.get("/saved-gyms/:userId", verifyToken, (req, res) => {
    const sql = `
    SELECT g.*, p.name AS province, c.name AS category, pr.bundle_name AS pricing_bundle, pr.price,
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
        if (err) return res.status(500).json({ error: "Database error" });
        results.forEach(gym => gym.images = gym.images ? gym.images.split(",") : []);
        res.json(results);
    });
});
router.get("/saved-gyms", verifyToken, (req, res) => {
    req.params.userId = req.user.id;
    exports.getSavedGyms(req, res);
});
router.delete("/saved-gyms/:userId/:gymId", verifyToken, (req, res) => {
    const { userId, gymId } = req.params;
    const sql = "DELETE FROM saved_gyms WHERE user_id = ? AND gym_id = ?";
    db.query(sql, [userId, gymId], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (result.affectedRows === 0) return res.status(404).json({ error: "Saved gym not found" });
        res.json({ message: "✅ Saved gym deleted successfully!" });
    });
});
router.post("/save-gym", verifyToken, (req, res) => {
    const { userId, gymId } = req.body;

    if (!userId || !gymId) {
        return res.status(400).json({ error: "Missing userId or gymId" });
    }

    const sql = `
        INSERT INTO saved_gyms (user_id, gym_id)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE gym_id = gym_id
    `;

    db.query(sql, [userId, gymId], (err) => {
        if (err) {
            console.error("❌ MySQL error:", err); // 👈 log detail
            return res.status(500).json({ error: "Database error", details: err });
        }
        res.json({ message: "✅ Gym saved successfully!" });
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
