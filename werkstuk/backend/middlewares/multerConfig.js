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

// 📁 Video's (optioneel)
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

// ✅ Losse uploaders
const upload = multer({ storage: uploadStorage });               // User profiel
const gymUpload = multer({ storage: gymStorage });               // Algemeen
const uploadLogo = multer({ storage: logoStorage }).single("logo");
const uploadImages = multer({ storage: gymStorage }).array("images", 5);
const uploadImage = multer({ storage: gymStorage }).single("image");

// ✅ COMBINATIE: Logo + Images in één formulier
const uploadGymFields = multer().fields([
  { name: "logo", maxCount: 1 },
  { name: "images", maxCount: 5 }
]);

module.exports = {
  upload,            // user profiel
  gymUpload,
  uploadLogo,
  uploadImage,
  uploadImages,
  uploadGymFields    // 👈 gebruik deze in je gym route
};
