const { db } = require("../config/db");

exports.getCommentsByGymId = (req, res) => {
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
};

exports.addComment = (req, res) => {
  const { gymId, commentText, title } = req.body;
  const userId = req.user.id;
  const sql = "INSERT INTO comments (user_id, gym_id, comment_text, title) VALUES (?, ?, ?, ?)";
  db.query(sql, [userId, gymId, commentText, title], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.status(201).json({
      id: result.insertId,
      user_id: userId,
      gym_id: gymId,
      comment_text: commentText,
      title
    });
  });
};

exports.likeComment = (req, res) => {
  const { commentId, userId } = req.body;

  const checkSql = "SELECT * FROM likes WHERE comment_id = ? AND user_id = ?";
  db.query(checkSql, [commentId, userId], (err, results) => {
    if (err) return res.status(500).json({ error: "Error checking like" });
    if (results.length) return res.status(400).json({ error: "Already liked" });

    const insertSql = "INSERT INTO likes (comment_id, user_id) VALUES (?, ?)";
    db.query(insertSql, [commentId, userId], (err) => {
      if (err) return res.status(500).json({ error: "Error liking comment" });

      const updateSql = `
        UPDATE comments 
        SET likes = likes + 1, 
        liked_by_users = CONCAT(IFNULL(liked_by_users, ''), ?, ',') 
        WHERE id = ?
      `;
      db.query(updateSql, [userId, commentId], (err) => {
        if (err) return res.status(500).json({ error: "Error updating comment" });
        res.json({ message: "Comment liked successfully" });
      });
    });
  });
};
