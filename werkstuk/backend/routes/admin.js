const { db } = require("../config/db");
const express = require("express");
const router = express.Router();
const { gymUpload } = require("../middlewares/multerConfig");
router.get("/:adminId", (req, res) => {
    const sql = `
    SELECT g.*, p.name AS province, c.name AS category, pr.bundle_name AS pricing_bundle, pr.price
    FROM gyms g
    JOIN provinces p ON g.province_id = p.id
    JOIN categories c ON g.category_id = c.id
    LEFT JOIN prices pr ON g.pricing_id = pr.id
    WHERE g.admin_id = ?
    `;
    db.query(sql, [req.params.adminId], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json(results);
    });
});
router.post("/add-gym", gymUpload.single("image"), (req, res) => {
    const { name, city, rating, category_id, opening_hours, address, personal_trainer, pricing_id, province_id, admin_id, description, email, phone, website } = req.body;
    const imageUrl = req.file?.path;

    if (!imageUrl) return res.status(400).json({ error: "❌ No image uploaded!" });

    const sql = `
        INSERT INTO gyms (name, city, rating, category_id, opening_hours, address, personal_trainer, 
        pricing_id, province_id, image_url, admin_id, description, email, phone, website)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [name, city, rating, category_id, opening_hours, address, personal_trainer, pricing_id, province_id, imageUrl, admin_id, description, email, phone, website];

    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.status(201).json({ message: "✅ Gym Added!", gymId: result.insertId, imageUrl });
    });
});
router.post("/admin/upload-gym-image", gymUpload.single("image"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "❌ No file uploaded!" });
    res.status(201).json({ message: "✅ Gym Image Uploaded!", imageUrl: req.file.path });
});
module.exports = router;
