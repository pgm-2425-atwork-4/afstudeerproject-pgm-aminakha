const express = require("express");
const { verifyToken } = require("../middlewares/auth");
const { upload, uploadFields, gymUpload, uploadImages, uploadLogo, uploadGymFields } = require("../middlewares/multerConfig");
const gymController = require("../controllers/gymController");

const router = express.Router();

router.get("/", gymController.getAllGyms);
router.get("/:id", gymController.getGymById);
router.post("/add-gym", uploadGymFields, gymController.addGym);
router.put("/:id", verifyToken, uploadLogo, gymController.updateGym); // ✅ correct
router.delete("/:id", verifyToken, gymController.deleteGym);

router.post("/upload-gym-image", gymUpload.single("image"), gymController.uploadGymImage);

router.get("/admin/:adminId", gymController.getGymsByAdmin);
router.post("/admin/add-gym", gymUpload.single("image"), gymController.adminAddGym);
router.post("/admin/upload-gym-image", gymUpload.single("image"), gymController.adminUploadGymImage);

module.exports = router;
