const { db } = require("../config/db");

exports.getAllGyms = (req, res) => {
  const sql = `
    SELECT g.*, 
           p.name AS province, 
           c.name AS category, 
           pres.name AS pressure, 
           GROUP_CONCAT(i.image_url) AS images
    FROM gyms g
    LEFT JOIN provinces p ON g.province_id = p.id
    LEFT JOIN categories c ON g.category_id = c.id
    LEFT JOIN images i ON g.id = i.gym_id
    LEFT JOIN pressures pres ON g.pressure_id = pres.id
    GROUP BY g.id
  `;

  db.query(sql, (err, gyms) => {
    if (err) return res.status(500).json({ error: "❌ Failed to fetch gyms" });

    // Voor elke gym: prijzen ophalen
    const gymIds = gyms.map(g => g.id);
    if (gymIds.length === 0) return res.json([]);

    const priceSql = `
      SELECT * FROM prices WHERE gym_id IN (?)
    `;
    db.query(priceSql, [gymIds], (err2, prices) => {
      if (err2) return res.status(500).json({ error: "❌ Failed to fetch prices" });

      // Koppel prijzen aan gyms
      gyms.forEach(gym => {
        gym.images = gym.images ? gym.images.split(",") : [];
        gym.prices = prices.filter(p => p.gym_id === gym.id);
      });

      res.json(gyms);
    });
  });
};

exports.getGymById = (req, res) => {
  const sql = `
    SELECT g.*, p.name AS province, c.name AS category, pr.description AS pricing_bundle, pr.price,
           pres.name AS pressure, GROUP_CONCAT(i.image_url) AS images
    FROM gyms g
    LEFT JOIN provinces p ON g.province_id = p.id
    LEFT JOIN categories c ON g.category_id = c.id
    LEFT JOIN prices pr ON g.pricing_id = pr.id
    LEFT JOIN images i ON g.id = i.gym_id
    LEFT JOIN pressures pres ON g.pressure_id = pres.id
    WHERE g.id = ?
    GROUP BY g.id;
  `;
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0) return res.status(404).json({ error: "Gym not found" });
    const gym = results[0];
    gym.images = gym.images ? gym.images.split(",") : [];
    res.json(gym);
  });
};

exports.addGym = (req, res) => {
  console.log("✅ files:", req.files);
  console.log("✅ body:", req.body);

  // ✅ Alle velden destructureren
  const {
    name,
    city,
    rating,
    opening_hours,
    address,
    personal_trainer,
    pressure_id,
    category_id,
    province_id,
    email,
    phone,
    website,
    priceOne,
    descriptionOne,
    planTypeOne,
    priceTwo,
    descriptionTwo,
    planTypeTwo,
    priceThree,
    descriptionThree,
    planTypeThree
  } = req.body;

  // ✅ Extra logging
  console.log("✅ PRICE FIELDS:", priceOne, descriptionOne, planTypeOne);
  console.log("✅ PRICE FIELDS:", priceTwo, descriptionTwo, planTypeTwo);
  console.log("✅ PRICE FIELDS:", priceThree, descriptionThree, planTypeThree);

  // ✅ Cloudinary URL's
  const logoUrl = req.files["logo"]?.[0]?.path || null;
  const imageUrls = req.files["images"]?.map(file => file.path) || [];

  // ✅ Validatie
  if (!name || !city || !rating || !opening_hours || !address || !category_id || !province_id) {
    return res.status(400).json({ error: "❌ Missing required fields" });
  }

  // ✅ Gym invoegen
  const sql = `
    INSERT INTO gyms (
      name, city, rating, opening_hours, address, personal_trainer,
      pressure_id, category_id, province_id, logo, email, phone, website
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    name,
    city,
    rating,
    opening_hours,
    address,
    personal_trainer,
    pressure_id,
    category_id,
    province_id,
    logoUrl,
    email,
    phone,
    website
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("❌ DB insert error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    const gymId = result.insertId;

    // 💰 Prijzen voorbereiden
    const pricePlans = [
      [priceOne, descriptionOne, planTypeOne],
      [priceTwo, descriptionTwo, planTypeTwo],
      [priceThree, descriptionThree, planTypeThree]
    ].filter(([price, desc, plan]) => price && desc && plan);

    const insertPrices = (callback) => {
      if (pricePlans.length === 0) return callback();

      const enriched = pricePlans.map(([price, desc, plan]) => [price, desc, plan, gymId]);
      const priceSql = "INSERT INTO prices (price, description, plan_type, gym_id) VALUES ?";
      db.query(priceSql, [enriched], (priceErr) => {
        if (priceErr) {
          console.error("❌ Price insert error:", priceErr);
          return res.status(500).json({ error: "Price insert error" });
        }
        callback();
      });
    };

    // 🖼️ Afbeeldingen toevoegen
    const insertImages = () => {
      if (imageUrls.length === 0) {
        return res.status(201).json({ message: "✅ Gym Added!", gymId });
      }

      const imgSql = "INSERT INTO images (gym_id, image_url) VALUES ?";
      const imgValues = imageUrls.map((url) => [gymId, url]);

      db.query(imgSql, [imgValues], (imgErr) => {
        if (imgErr) {
          console.error("❌ Image insert error:", imgErr);
          return res.status(500).json({ error: "Image insert error" });
        }

        res.status(201).json({
          message: "✅ Gym & Prices Added!",
          gymId,
          logo: logoUrl,
          images: imageUrls
        });
      });
    };

    // 🔁 Eerst prijzen, dan afbeeldingen
    insertPrices(insertImages);
  });
};


exports.updateGym = (req, res) => {
  const { name, city, rating, opening_hours, address, email, phone, website } = req.body;
  const gymId = req.params.id;
  const logoUrl = req.file?.path || null;

  if (!name || !city || !rating || !opening_hours || !address) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  let sql = `
    UPDATE gyms SET name = ?, city = ?, rating = ?, opening_hours = ?, address = ?,
    email = ?, phone = ?, website = ?
  `;
  const values = [name, city, rating, opening_hours, address, email, phone, website];

  if (logoUrl) {
    sql += ", logo = ?";
    values.push(logoUrl);
  }

  sql += " WHERE id = ?";
  values.push(gymId);

  db.query(sql, values, (err) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ message: "✅ Gym updated successfully!" });
  });
};

exports.deleteGym = (req, res) => {
  db.query("DELETE FROM gyms WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (result.affectedRows === 0) return res.status(404).json({ error: "❌ Gym not found" });
    res.json({ message: "✅ Gym deleted successfully!" });
  });
};

exports.uploadGymImage = (req, res) => {
  if (!req.file) return res.status(400).json({ error: "❌ No file uploaded!" });
  res.status(201).json({ message: "✅ Gym Image Uploaded!", imageUrl: req.file.path });
};

exports.getGymsByAdmin = (req, res) => {
  const sql = `
    SELECT g.*, p.name AS province, c.name AS category, pr.bundle_name AS pricing_bundle, pr.price
    FROM gyms g
    JOIN provinces p ON g.province_id = p.id
    JOIN categories c ON g.category_id = c.id
    LEFT JOIN prices pr ON g.pricing_id = pr.id
    WHERE g.admin_id = ?
  `;
  db.query(sql, [req.params.adminId], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
};

exports.adminAddGym = (req, res) => {
  const { name, city, rating, category_id, opening_hours, address, personal_trainer, pricing_id, province_id, admin_id, description, email, phone, website } = req.body;
  const imageUrl = req.file?.path;

  if (!imageUrl) return res.status(400).json({ error: "❌ No image uploaded!" });

  const sql = `
    INSERT INTO gyms (name, city, rating, category_id, opening_hours, address, personal_trainer, 
      pricing_id, province_id, image_url, admin_id, description, email, phone, website)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [name, city, rating, category_id, opening_hours, address, personal_trainer, pricing_id, province_id, imageUrl, admin_id, description, email, phone, website];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.status(201).json({ message: "✅ Gym Added!", gymId: result.insertId, imageUrl });
  });
};

exports.adminUploadGymImage = (req, res) => {
  if (!req.file) return res.status(400).json({ error: "❌ No file uploaded!" });
  res.status(201).json({ message: "✅ Gym Image Uploaded!", imageUrl: req.file.path });
};
