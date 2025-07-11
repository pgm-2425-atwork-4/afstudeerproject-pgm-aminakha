const express = require("express");
const  {getProvinces}  = require("../controllers/provinceController");
const router = express.Router();
console.log("Loading provinces routes...");

router.get("/", getProvinces);

module.exports = router;