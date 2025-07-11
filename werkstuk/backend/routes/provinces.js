const express = require("express");
const { getPressures } = require("../controllers/pressuresController");

const router = express.Router();
console.log("Loading pressures routes...");

router.get("/", getPressures);

module.exports = router;