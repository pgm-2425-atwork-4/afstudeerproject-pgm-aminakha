const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// 📁 Gebruikersuploads
const uploadStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "user_uploads",
    format: async () => "png",
    public_id: (req, file) =>
      Date.now() + "-user-" + file.originalname.replace(/\s/g, "_")
  }
});

// 📁 Gym images
const gymStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "gym_images",
    format: async () => "png",
    public_id: (req, file) =>
      Date.now() + "-img-" + file.originalname.replace(/\s/g, "_")
  }
});

// 📁 Video's (optioneel, mag blijven)
const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "exercise_videos",
    format: async () => "mp4",
    public_id: (req, file) =>
      Date.now() + "-video-" + file.originalname.replace(/\s/g, "_")
  }
});

// 📁 Logo's
const logoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "gym_logos",
    format: async () => "png",
    public_id: (req, file) =>
      Date.now() + "-logo-" + file.originalname.replace(/\s/g, "_")
  }
});

// ✅ Multer-instances
const upload = multer({ storage: uploadStorage });               // User profiel
const gymUpload = multer({ storage: gymStorage });               // Algemeen
const uploadLogo = multer({ storage: logoStorage }).single("logo");   // 1x logo
const uploadImages = multer({ storage: gymStorage }).array("images", 5); // max 5 images
const uploadImage = multer({ storage: gymStorage }).single("image");    // losse image

module.exports = {
  upload,          // voor user-profiel
  gymUpload,       // algemeen
  uploadLogo,      // 1x logo
  uploadImage,     // losse image
  uploadImages     // max 5 images
};
