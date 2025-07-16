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
router.post("/admin/add-exercise", uploadImage, (req, res) => {
  const { name, exercise_category_id, pressure_id, big_description } = req.body;
  const imageUrl = req.file?.path;

  const query = `
    INSERT INTO exercises (name, image, exercise_category_id, pressure_id, big_description)
    VALUES (?, ?, ?, ?, ?)
  `;

  const values = [name, imageUrl, exercise_category_id, pressure_id, big_description];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("❌ DB Insert Error:", err);
      return res.status(500).json({ error: "Failed to add exercise" });
    }
    res.json({ message: "Exercise added successfully", id: result.insertId });
  });
});


module.exports = router;