const express = require("express");
const { verifyToken } = require("../middlewares/auth");
const commentController = require("../controllers/commentController");

const router = express.Router();

router.get("/:gymId", commentController.getCommentsByGymId);
router.post("/", verifyToken, commentController.addComment);
router.post("/like", commentController.likeComment);

module.exports = router;
