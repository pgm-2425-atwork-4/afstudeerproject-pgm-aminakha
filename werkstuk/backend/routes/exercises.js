const express = require("express");
const router = express.Router();
const { db } = require('../config/db');  
const { uploadImage, exerciseImages } = require("../middlewares/multerConfig");

router.get("/categories", (req, res) => {
    db.query("SELECT * FROM exercise_categories", (err, results) => {
        if (err) {
        console.error("Error fetching exercise categories:", err);
        return res.status(500).json({ error: "Internal server error" });
        }
        res.json(results);
    });
});

router.post("/admin/add-exercise", exerciseImages, (req, res) => {
  const { name, exercise_category_id, pressure_id, big_description } = req.body;
  const imageUrls = req.files.map(file => file.path);

  const insertExercise = `
    INSERT INTO exercises (name, exercise_category_id, pressure_id, big_description)
    VALUES (?, ?, ?, ?)
  `;
  const exerciseValues = [name, exercise_category_id, pressure_id, big_description];

  db.query(insertExercise, exerciseValues, (err, result) => {
    if (err) {
      console.error("❌ Error inserting exercise:", err);
      return res.status(500).json({ error: "Failed to insert exercise" });
    }

    const exerciseId = result.insertId;

    const insertImage = `
      INSERT INTO exercise_images (exercise_id, image_url)
      VALUES (?, ?)
    `;
    db.query(insertImage, [exerciseId, imageUrl], (err2) => {
      if (err2) {
        console.error("❌ Error inserting exercise image:", err2);
        return res.status(500).json({ error: "Failed to insert exercise image" });
      }

      res.json({ message: "✅ Exercise and image inserted", id: exerciseId });
    });
  });
});


router.get("/", (req, res) => {
  db.query(`SELECT * FROM exercises`, (err, results) => {
    if (err) {
      console.error("Error fetching exercises:", err);
      return res.status(500).json({ error: "Internal server error!" });
    }
    res.json(results);
  });
});
router.get('/:id/images', (req, res) => {
  const exerciseId = req.params.id;
  db.query(`SELECT * FROM exercise_images WHERE exercise_id = ?`, [exerciseId], (err, results) => {
    if (err) {
      console.error("Error fetching exercise images:", err);
      return res.status(500).json({ error: "Internal server error!" });
    }
    res.json(results);
  });
});

module.exports = router;