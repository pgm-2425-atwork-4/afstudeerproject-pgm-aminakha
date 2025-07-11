const express = require("express");
const { verifyToken } = require("../middlewares/auth");
const { upload, uploadFields, gymUpload, uploadImages, uploadLogo } = require("../middlewares/multerConfig");
const gymController = require("../controllers/gymController");

const router = express.Router();

router.get("/", gymController.getAllGyms);
router.get("/:id", gymController.getGymById);
router.post(
  "/add-gym",
  uploadLogo.single("logo"), // eerst logo uploaden
  (req, res, next) => {
    uploadImages(req, res, function (err) {
      if (err) {
        return res.status(400).json({ error: "Image upload failed", details: err.message });
      }
      next();
    });
  },
  gymController.addGym
);
router.put("/:id", verifyToken, uploadLogo.single("logo"), gymController.updateGym);
router.delete("/:id", verifyToken, gymController.deleteGym);

router.post("/upload-gym-image", gymUpload.single("image"), gymController.uploadGymImage);

router.get("/admin/:adminId", gymController.getGymsByAdmin);
router.post("/admin/add-gym", gymUpload.single("image"), gymController.adminAddGym);
router.post("/admin/upload-gym-image", gymUpload.single("image"), gymController.adminUploadGymImage);

module.exports = router;
