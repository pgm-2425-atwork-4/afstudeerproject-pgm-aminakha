const express = require("express");
const router = express.Router();
console.log("Loading provinces routes...");
const { db } = require("../config/db");

router.get("/", (req, res) => {
    const sql = "SELECT id, name FROM provinces";
    db.query(sql, (err, results) => {
        if (err) {
        console.error("🔥 Error fetching provinces:", err);
        return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});

module.exports = router;