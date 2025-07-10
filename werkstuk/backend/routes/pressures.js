const express = require("express");
const { getPressures } = require("../controllers/pressuresController");

const router = express.Router();

router.get("/", getPressures);

module.exports = router;