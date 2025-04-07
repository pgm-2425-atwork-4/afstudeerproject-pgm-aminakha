const express = require("express");
const { verifyToken } = require("../middlewares/auth");
const { upload } = require("../middlewares/multerConfig");
const userController = require("../controllers/userController");

const router = express.Router();

router.get("/:id", userController.getUserById);
router.put("/:id", verifyToken, upload.single("profileImage"), userController.updateUser);
router.get("/saved-gyms/:userId", verifyToken, userController.getSavedGyms);
router.get("/saved-gyms", verifyToken, userController.getSavedGymsSelf);
router.delete("/saved-gyms/:userId/:gymId", verifyToken, userController.deleteSavedGym);
router.post("/save-gym", verifyToken, userController.saveGym);
router.post("/upload/profile", upload.single("profileImage"), userController.uploadProfileImage);
router.delete("/truncate", userController.truncateUsers);

module.exports = router;
