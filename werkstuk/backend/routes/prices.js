const express = require("express");
const { db } = require("../config/db");
const router = express.Router();

router.get("/", (req, res) => {
    const sql = "SELECT * FROM prices";
    console.log("📥 Executing SQL:", sql); 
    db.query(sql, (err, results) => {
        if (err) {
            console.error("❌ MySQL Error:", err); 
            return res.status(500).json({ error: "Database error", details: err });
        }
        console.log("✅ Price results:", results);
        res.status(200).json(results);
    });
});

module.exports = router;