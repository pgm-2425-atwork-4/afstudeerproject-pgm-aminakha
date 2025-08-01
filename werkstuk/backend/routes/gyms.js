const express = require("express");
const { verifyToken } = require("../middlewares/auth");
const { upload, uploadFields, gymUpload, uploadImages, uploadLogo, uploadGymFields } = require("../middlewares/multerConfig");
const { db } = require("../config/db");
const router = express.Router();

router.get("/", (req, res) => {
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
        const gymIds = gyms.map(g => g.id);
        if (gymIds.length === 0) return res.json([]);
        const priceSql = `
            SELECT * FROM prices WHERE gym_id IN (?)
        `;
        db.query(priceSql, [gymIds], (err2, prices) => {
        if (err2) return res.status(500).json({ error: "❌ Failed to fetch prices" });
        gyms.forEach(gym => {
            gym.images = gym.images ? gym.images.split(",") : [];
            gym.prices = prices.filter(p => p.gym_id === gym.id);
        });
        res.json(gyms);
        });
    });
});

router.get("/:id", (req, res) => {
    const sql = `
        SELECT g.*, 
            p.name AS province, 
            c.name AS category, 
            pres.name AS pressure, 
            GROUP_CONCAT(i.image_url) AS images
        FROM gyms g
        LEFT JOIN provinces p ON g.province_id = p.id
        LEFT JOIN categories c ON g.category_id = c.id
        LEFT JOIN pressures pres ON g.pressure_id = pres.id
        LEFT JOIN images i ON g.id = i.gym_id
        WHERE g.id = ?
        GROUP BY g.id;
    `;

    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (results.length === 0) return res.status(404).json({ error: "Gym not found" });
        const gym = results[0];
        gym.images = gym.images ? gym.images.split(",") : [];
        const priceSql = `SELECT id, price, description, plan_type FROM prices WHERE gym_id = ?`;
        db.query(priceSql, [gym.id], (priceErr, priceResults) => {
            if (priceErr) return res.status(500).json({ error: "Price fetch error" });
            gym.prices = priceResults;
            res.json(gym);
        });
    });
});

router.post("/add-gym", uploadGymFields, (req, res) => {
    console.log("✅ files:", req.files);
    console.log("✅ body:", req.body);

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

    console.log("✅ PRICE FIELDS:", priceOne, descriptionOne, planTypeOne);
    console.log("✅ PRICE FIELDS:", priceTwo, descriptionTwo, planTypeTwo);
    console.log("✅ PRICE FIELDS:", priceThree, descriptionThree, planTypeThree);

    const logoUrl = req.files["logo"]?.[0]?.path || null;
    const imageUrls = req.files["images"]?.map(file => file.path) || [];

    if (!name || !city || !rating || !opening_hours || !address || !category_id || !province_id) {
        return res.status(400).json({ error: "❌ Missing required fields" });
    }

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
    insertPrices(insertImages);
    });
});
router.put("/:id", verifyToken, uploadGymFields, (req, res) => {
  const gymId = req.params.id;
  const {
    name,
    city,
    rating,
    opening_hours,
    address,
    email,
    phone,
    website,
    personal_trainer,
    pressure_id,
    category_id,
    province_id,
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

  const logoUrl = req.files["logo"]?.[0]?.path || null;
  const imageUrls = req.files["images"]?.map(file => file.path) || [];

  if (!name || !city || !rating || !opening_hours || !address || !category_id || !province_id) {
    return res.status(400).json({ error: "❌ Missing required fields" });
  }

  const sql = `
    UPDATE gyms SET
      name = ?, city = ?, rating = ?, opening_hours = ?, address = ?,
      email = ?, phone = ?, website = ?, personal_trainer = ?, pressure_id = ?, 
      category_id = ?, province_id = ?
      ${logoUrl ? ", logo = ?" : ""}
    WHERE id = ?
  `;

  const values = [
    name,
    city,
    rating,
    opening_hours,
    address,
    email,
    phone,
    website,
    personal_trainer,
    pressure_id,
    category_id,
    province_id,
  ];

  if (logoUrl) values.push(logoUrl);
  values.push(gymId);

  db.query(sql, values, (err) => {
    if (err) {
      console.error("❌ Update gym error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    db.query("DELETE FROM prices WHERE gym_id = ?", [gymId], (priceDelErr) => {
      if (priceDelErr) {
        console.error("❌ Failed to delete old prices:", priceDelErr);
        return res.status(500).json({ error: "Failed to update prices" });
      }

      const pricePlans = [
        [priceOne, descriptionOne, planTypeOne],
        [priceTwo, descriptionTwo, planTypeTwo],
        [priceThree, descriptionThree, planTypeThree]
      ].filter(([price, desc, plan]) => price && desc && plan);

      if (pricePlans.length === 0) return insertImages();

      const enriched = pricePlans.map(([price, desc, plan]) => [price, desc, plan, gymId]);
      const priceSql = "INSERT INTO prices (price, description, plan_type, gym_id) VALUES ?";

      db.query(priceSql, [enriched], (priceErr) => {
        if (priceErr) {
          console.error("❌ Insert price error:", priceErr);
          return res.status(500).json({ error: "Price insert error" });
        }

        insertImages();
      });
    });

    function insertImages() {
      if (imageUrls.length === 0) {
        return res.json({ message: "✅ Gym updated successfully!" });
      }

      const imgSql = "INSERT INTO images (gym_id, image_url) VALUES ?";
      const imgValues = imageUrls.map((url) => [gymId, url]);

      db.query(imgSql, [imgValues], (imgErr) => {
        if (imgErr) {
          console.error("❌ Image insert error:", imgErr);
          return res.status(500).json({ error: "Image insert error" });
        }
        res.json({
          message: "✅ Gym fully updated!",
          images: imageUrls
        });
      });
    }
  });
});

router.put("/:id", verifyToken, uploadLogo, (req, res) => {
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
}); 

router.delete("/:id", verifyToken, (req, res) => {
    db.query("DELETE FROM gyms WHERE id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (result.affectedRows === 0) return res.status(404).json({ error: "❌ Gym not found" });
        res.json({ message: "✅ Gym deleted successfully!" });
    });
});

router.get('/:gymId/images', async (req, res) => {
    try {
        const { gymId } = req.params;
        const data =  db.query(
            'SELECT * FROM gym_images WHERE gym_id = $1',
            [gymId]
        );
        res.status(200).json(data.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});


router.post("/upload-gym-image", gymUpload.single("image"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "❌ No file uploaded!" });
    res.status(201).json({ message: "✅ Gym Image Uploaded!", imageUrl: req.file.path });
});



module.exports = router;
