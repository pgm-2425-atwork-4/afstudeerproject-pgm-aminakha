const express = require("express");
const router = express.Router();
const { db } = require('../config/db');  

router.get("/categories", (req, res) => {
    db.query("SELECT * FROM exercise_categories", (err, results) => {
        if (err) {
        console.error("Error fetching exercise categories:", err);
        return res.status(500).json({ error: "Internal server error" });
        }
        res.json(results);
    });
});
module.exports = router;