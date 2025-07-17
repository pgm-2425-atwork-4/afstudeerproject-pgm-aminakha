const express = require("express");
const { db } = require("../config/db");
const router = express.Router();

router.get("/", (req, res) => {
    const sql = "SELECT id, name FROM pressures";
    db.query(sql, (err, results) => {
        if (err) {
        console.error("🔥 Error fetching pressures:", err);
        return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});

module.exports = router;