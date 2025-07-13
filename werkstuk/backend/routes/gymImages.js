const express = require("express");
const { db } = require("../config/db");

const router = express.Router();

router.get('/:gymId/images', async (req, res) => {
    try {
        const { gymId } = req.params;
        const data = await db.query(
            'SELECT * FROM gym_images WHERE gym_id = $1',
            [gymId]
        );
        res.status(200).json(data.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;