const express = require("express");
const router = express.Router();
const { db } = require('../config/db');  
const { exerciseImages, upload } = require("../middlewares/multerConfig");

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
router.put("/admin/update-category/:id", upload.single("image"), (req, res) => {
  const categoryId = req.params.id;
  const { name } = req.body;
  const imageUrl = req.file?.path || null;

  if (!name) {
    return res.status(400).json({ error: "❌ Naam is vereist" });
  }

  let sql = `UPDATE exercise_categories SET name = ?`;
  const values = [name];

  if (imageUrl) {
    sql += `, symbol = ?`;
    values.push(imageUrl);
  }

  sql += ` WHERE id = ?`;
  values.push(categoryId);

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("❌ Fout bij updaten categorie:", err);
      return res.status(500).json({ error: "Fout bij bijwerken categorie" });
    }

    res.json({ message: "✅ Categorie bijgewerkt", image_url: imageUrl });
  });
});


router.delete("/admin/delete-category/:id", (req, res) => {
  const categoryId = req.params.id;

  const sql = `DELETE FROM exercise_categories WHERE id = ?`;

  db.query(sql, [categoryId], (err, result) => {
    if (err) {
      console.error("❌ Fout bij verwijderen categorie:", err);
      return res.status(500).json({ error: "Fout bij verwijderen categorie" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Categorie niet gevonden" });
    }

    res.json({ message: "✅ Categorie verwijderd" });
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


router.post("/admin/add-category", upload.single("image"), (req, res) => {
  const { name } = req.body;
  const imageUrl = req.file?.path || null;

  if (!name || !imageUrl) {
    return res.status(400).json({ error: "❌ Naam en afbeelding zijn vereist" });
  }

  const sql = `
    INSERT INTO exercise_categories (name, symbol)
    VALUES (?, ?)
  `;
  const values = [name, imageUrl];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("❌ Fout bij invoegen categorie:", err);
      return res.status(500).json({ error: "Database fout bij categorie toevoegen" });
    }

    res.status(201).json({
      message: "✅ Categorie toegevoegd",
      id: result.insertId,
      image_url: imageUrl
    });
  });
});
router.put("/admin/exercise/:id", exerciseImages, (req, res) => {
  const exerciseId = req.params.id;
  const { name, exercise_category_id, pressure_id, big_description, duration } = req.body;
  const newImages = req.files?.map(file => file.path) || [];

  const sql = `
    UPDATE exercises SET 
      name = ?, 
      exercise_category_id = ?, 
      pressure_id = ?, 
      big_description = ?, 
      duration = ?, 
      images = COALESCE(?, images)
    WHERE id = ?
  `;
  const values = [name, exercise_category_id, pressure_id, big_description, duration, newImages.length ? JSON.stringify(newImages) : null, exerciseId];

  db.query(sql, values, (err) => {
    if (err) {
      console.error("❌ Fout bij bijwerken oefening:", err);
      return res.status(500).json({ error: "Database fout bij bijwerken oefening" });
    }

    res.json({ message: "✅ Oefening bijgewerkt" });
  });
});
router.delete("/admin/exercise/:id", (req, res) => {
  const id = req.params.id;

  const sql = "DELETE FROM exercises WHERE id = ?";
  db.query(sql, [id], (err) => {
    if (err) {
      console.error("❌ Fout bij verwijderen oefening:", err);
      return res.status(500).json({ error: "Database fout bij verwijderen" });
    }

    res.json({ message: "✅ Oefening verwijderd" });
  });
});
router.put("/admin/update-exercise/:id", exerciseImages, (req, res) => {
  const { id } = req.params;
  const { name, exercise_category_id, pressure_id, big_description, duration } = req.body;
  const imageUrls = req.files?.map(file => file.path) || [];

  const updateQuery = `
    UPDATE exercises
    SET name = ?, exercise_category_id = ?, pressure_id = ?, big_description = ?, duration = ?
    WHERE id = ?
  `;

  db.query(updateQuery, [name, exercise_category_id, pressure_id, big_description, duration, id], (err, result) => {
    if (err) {
      console.error("Error updating exercise:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Exercise not found" });
    }

    res.json({ message: "Exercise updated successfully" });
  });
});
router.put("/admin/categories/:id", (req, res) => {
  const categoryId = req.params.id;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Naam is verplicht" });
  }

  const sql = "UPDATE exercise_categories SET name = ? WHERE id = ?";
  db.query(sql, [name, categoryId], (err, result) => {
    if (err) {
      console.error("Fout bij bijwerken categorie:", err);
      return res.status(500).json({ error: "Interne serverfout" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Categorie niet gevonden" });
    }

    res.json({ message: "✅ Categorie succesvol bijgewerkt" });
  });
});

module.exports = router;