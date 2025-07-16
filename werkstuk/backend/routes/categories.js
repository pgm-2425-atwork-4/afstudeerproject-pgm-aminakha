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
router.post("/", verifyToken, upload.single("image"), categoryController.addCategory);
router.put("/:id", verifyToken, upload.single("image"), categoryController.updateCategory);
router.delete("/:id", verifyToken, categoryController.deleteCategory);

router.get("/pricing", categoryController.getPricing);
router.get("/provinces", categoryController.getProvinces);

module.exports = router;
