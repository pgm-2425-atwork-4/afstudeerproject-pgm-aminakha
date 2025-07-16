const express = require("express");
const { verifyToken } = require("../middlewares/auth");
const { upload } = require("../middlewares/multerConfig");
const categoryController = require("../controllers/categoryController");
const { db } = require("../config/db");

const router = express.Router();

router.get('/', (req,res) => {
    const sql = "SELECT * FROM categories";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("🔥 Error fetching categories:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
})
router.post("/", verifyToken, upload.single("image"), (req, res) => {
    const { name } = req.body;
    const imageUrl = req.file ? req.file.path : null;

    if (!name || !imageUrl) {
        return res.status(400).json({ error: "❌ Missing category name or image" });
    }

    const sql = "INSERT INTO categories (name, image_url) VALUES (?, ?)";
    db.query(sql, [name, imageUrl], (err, result) => {
        if (err) {
            console.error("🔥 Error inserting category:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.status(201).json({
            message: "✅ Category added successfully!",
            id: result.insertId,
            name,
            imageUrl
        });
    });
});
router.put("/:id", verifyToken, upload.single("image"), categoryController.updateCategory);
router.delete("/:id", verifyToken, categoryController.deleteCategory);

router.get("/pricing", categoryController.getPricing);
router.get("/provinces", categoryController.getProvinces);

module.exports = router;
