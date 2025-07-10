const express = require("express");
const { verifyToken } = require("../middlewares/auth");
const { upload } = require("../middlewares/multerConfig");
const categoryController = require("../controllers/categoryController");

const router = express.Router();

router.get("/", categoryController.getCategories);
router.post("/", verifyToken, upload.single("image"), categoryController.addCategory);
router.put("/:id", verifyToken, upload.single("image"), categoryController.updateCategory);
router.delete("/:id", verifyToken, categoryController.deleteCategory);

router.get("/pricing", categoryController.getPricing);
router.get("/provinces", categoryController.getProvinces);

module.exports = router;
