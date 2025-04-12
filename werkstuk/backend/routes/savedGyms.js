const express = require("express");
const router = express.Router();
const { deleteSavedGym } = require("../controllers/userController"); // or your savedGymsController
const { verifyToken } = require("../middlewares/auth");

router.delete("/:userId/:gymId", verifyToken, deleteSavedGym);

module.exports = router;