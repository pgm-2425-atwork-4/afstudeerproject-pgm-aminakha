// controllers/categoryController.js
const { db } = require("../config/db");

// GET all categories
exports.getCategories = (req, res) => {
  const sql = "SELECT * FROM categories";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("🔥 Error fetching categories:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
};

// POST add new category
exports.addCategory = (req, res) => {
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
};

// PUT update a category
exports.updateCategory = (req, res) => {
  const categoryId = req.params.id;
  const { name } = req.body;
  const image = req.file ? req.file.path : null;

  if (!name) {
    return res.status(400).json({ error: "❌ Category name required" });
  }

  let sql = "UPDATE categories SET name = ?";
  const values = [name];

  if (image) {
    sql += ", image_url = ?";
    values.push(image);
  }

  sql += " WHERE id = ?";
  values.push(categoryId);

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("🔥 Error updating category:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json({ message: "✅ Category updated successfully!" });
  });
};

// DELETE a category
exports.deleteCategory = (req, res) => {
  const categoryId = req.params.id;

  const sql = "DELETE FROM categories WHERE id = ?";
  db.query(sql, [categoryId], (err, result) => {
    if (err) {
      console.error("🔥 Error deleting category:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "❌ Category not found" });
    }

    res.json({ message: "✅ Category deleted successfully!" });
  });
};


// GET pricing
exports.getPricing = (req, res) => {
  const sql = "SELECT id, bundle_name, price FROM prices";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("🔥 Error fetching pricing:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
};

// GET provinces
exports.getProvinces = (req, res) => {
  const sql = "SELECT id, name FROM provinces";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("🔥 Error fetching provinces:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
};
