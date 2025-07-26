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
  const { name, exercise_category_id, pressure_id, big_description, duration } = req.body;
  const imageUrls = req.files?.map(file => file.path) || [];

  if (imageUrls.length === 0) {
    return res.status(400).json({ error: "❌ Minstens één afbeelding vereist" });
  }

  const insertExercise = `
    INSERT INTO exercises (name, exercise_category_id, pressure_id, big_description, duration)
    VALUES (?, ?, ?, ?, ?)
  `;
  const exerciseValues = [name, exercise_category_id, pressure_id, big_description, duration];

  db.query(insertExercise, exerciseValues, (err, result) => {
    if (err) {
      console.error("❌ Error inserting exercise:", err);
      return res.status(500).json({ error: "Failed to insert exercise" });
    }

    const exerciseId = result.insertId;

    // Insert alle afbeeldingen
    const insertImage = `
      INSERT INTO exercise_images (exercise_id, image_url)
      VALUES ?
    `;
    const imageValues = imageUrls.map(url => [exerciseId, url]);

    db.query(insertImage, [imageValues], (err2) => {
      if (err2) {
        console.error("❌ Error inserting exercise images:", err2);
        return res.status(500).json({ error: "Failed to insert exercise images" });
      }

      res.json({ message: "✅ Exercise and images inserted", id: exerciseId });
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

router.get('/:id', (req, res) => {
  const exerciseId = req.params.id;
  const query = `
    SELECT 
      e.*,
      pt.name AS pressure_name,
      ec.name AS category_name,
      ec.symbol AS category_symbol
    FROM 
      exercises e
    JOIN 
      exercise_categories ec ON e.exercise_category_id = ec.id
    JOIN 
      pressures pt ON e.pressure_id = pt.id
    WHERE 
      e.id = ?
  `;

  db.query(query, [exerciseId], (err, results) => {
    if (err) {
      console.error("Error fetching detailed exercise info:", err);
      return res.status(500).json({ error: "Internal server error!" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Exercise not found!" });
    }

    res.json(results[0]);
  });
});


module.exports = router;