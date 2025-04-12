const { db } = require("../config/db");
const bcrypt = require("bcrypt");

exports.getUserById = (req, res) => {
  const sql = "SELECT id, username, email, profile_image, firstname, lastname, birthday FROM users WHERE id = ?";
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!results.length) return res.status(404).json({ error: "User not found" });

    const user = results[0];
    user.profile_image = user.profile_image || "https://res.cloudinary.com/placeholder/default-user.png";
    res.json(user);
  });
};

exports.updateUser = async (req, res) => {
  const { username, firstname, lastname, email, password, birthday } = req.body;
  const userId = req.params.id;
  const profileImage = req.file ? req.file.path : null;
  const formattedBirthday = new Date(birthday).toISOString().split('T')[0];

  if (!username || !firstname || !lastname || !email || !birthday) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  let hashedPassword = password ? await bcrypt.hash(password, 10) : null;
  let query = "UPDATE users SET username = ?, firstname = ?, lastname = ?, email = ?, birthday = ?";
  const values = [username, firstname, lastname, email, formattedBirthday];

  if (hashedPassword) {
    query += ", password = ?";
    values.push(hashedPassword);
  }

  if (profileImage) {
    query += ", profile_image = ?";
    values.push(profileImage);
  }

  query += " WHERE id = ?";
  values.push(userId);

  db.query(query, values, (err) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ message: "✅ Profile updated successfully!" });
  });
};

exports.getSavedGyms = (req, res) => {
  const sql = `
    SELECT g.*, p.name AS province, c.name AS category, pr.bundle_name AS pricing_bundle, pr.price,
           pres.name AS pressure, GROUP_CONCAT(i.image_url) AS images
    FROM saved_gyms sg
    JOIN gyms g ON sg.gym_id = g.id
    LEFT JOIN provinces p ON g.province_id = p.id
    LEFT JOIN categories c ON g.category_id = c.id
    LEFT JOIN prices pr ON g.pricing_id = pr.id
    LEFT JOIN images i ON g.id = i.gym_id
    LEFT JOIN pressures pres ON g.pressure_id = pres.id
    WHERE sg.user_id = ?
    GROUP BY g.id;
  `;
  db.query(sql, [req.params.userId], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    results.forEach(gym => gym.images = gym.images ? gym.images.split(",") : []);
    res.json(results);
  });
};

exports.getSavedGymsSelf = (req, res) => {
  req.params.userId = req.user.id;
  exports.getSavedGyms(req, res);
};

exports.deleteSavedGym = (req, res) => {
  const { userId, gymId } = req.params;
  const sql = "DELETE FROM saved_gyms WHERE user_id = ? AND gym_id = ?";
  db.query(sql, [userId, gymId], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Saved gym not found" });
    res.json({ message: "✅ Saved gym deleted successfully!" });
  });
};

exports.saveGym = (req, res) => {
  const { userId, gymId } = req.body;
  const sql = "INSERT INTO saved_gyms (user_id, gym_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE gym_id = gym_id";
  db.query(sql, [userId, gymId], (err) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ message: "✅ Gym saved successfully!" });
  });
};

exports.uploadProfileImage = (req, res) => {
  if (!req.file) return res.status(400).json({ error: "❌ No file uploaded" });
  const filePath = `/uploads/${req.file.filename}`;
  res.json({ filePath });
};

exports.truncateUsers = (req, res) => {
  db.query("TRUNCATE TABLE users", (err) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ message: "✅ All users deleted!" });
  });
};

exports.deleteSavedGym = (req, res) => {
  const { userId, gymId } = req.params;

  if (!userId || !gymId) {
    return res.status(400).json({ error: "❌ Missing userId or gymId" });
  }

  const sql = "DELETE FROM saved_gyms WHERE user_id = ? AND gym_id = ?";

  db.query(sql, [userId, gymId], (err, result) => {
    if (err) {
      console.error("🔥 Error deleting saved gym:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "❌ Saved gym not found" });
    }

    res.json({ message: "✅ Saved gym deleted successfully!" });
  });
};