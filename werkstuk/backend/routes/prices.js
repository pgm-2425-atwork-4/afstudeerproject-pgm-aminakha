const express = require("express");
const { getPrices } = require("../controllers/priceController");

const router = express.Router();

router.get("/", getPrices);

module.exports = router;