const express = require("express");
const { verifyToken } = require("../middlewares/auth");
const { db } = require("../config/db");
const router = express.Router();

router.get("/:gymId", (req, res) => {
    const sql = `
        SELECT c.*, u.username, u.profile_image
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.gym_id = ?
    `;
    db.query(sql, [req.params.gymId], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json(results.length ? results : []);
    });
});
router.post("/", verifyToken, (req, res) => {
    const { gymId, commentText, title } = req.body;
    if (!req.user || !req.user.id) {
        return res.status(401).json({ error: "Unauthorized – missing user" });
    }
    if (!gymId || !commentText || !title) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    const userId = req.user.id;
    const sql = `
        INSERT INTO comments (user_id, gym_id, description, title)
        VALUES (?, ?, ?, ?)
    `;
    db.query(sql, [userId, gymId, commentText, title], (err, result) => {
        if (err) {
            console.error("❌ MySQL error:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.status(201).json({
            id: result.insertId,
            user_id: userId,
            gym_id: gymId,
            description: commentText,
            title
        });
    });
});

router.get('/exercise/:id/comments', (req, res) => {
  const exerciseId = req.params.id;
  const sql = `
    SELECT comments.*, users.username, users.profile_image 
    FROM comments 
    JOIN users ON comments.user_id = users.id 
    WHERE comments.exercise_id = ? 
    ORDER BY comments.created_at DESC
  `;
  db.query(sql, [exerciseId], (err, results) => {
    if (err) return res.status(500).json({ error: '❌ DB error' });
    res.json(results);
  });
});

router.post('/exercise/:id', verifyToken, (req, res) => {
  const exerciseId = req.params.id;
  const { title, description } = req.body;
  const userId = req.user.id; 

  if (!title || !description) {
    return res.status(400).json({ error: "Title and description are required" });
  }

  const sql = `
    INSERT INTO exercise_comments (exercise_id, user_id, title, description)
    VALUES (?, ?, ?, ?)
  `;
  db.query(sql, [exerciseId, userId, title, description], (err, result) => {
    if (err) {
      console.error("❌ Error inserting exercise comment:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ message: "✅ Comment added successfully!", id: result.insertId });
  });
});

module.exports = router;
