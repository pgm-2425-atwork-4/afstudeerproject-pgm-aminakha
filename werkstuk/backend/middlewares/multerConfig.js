const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// 📁 User profiel upload (bijv. avatar)
const uploadStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "user_uploads",
    format: async () => "png",
    public_id: (req, file) =>
      Date.now() + "-user-" + file.originalname.replace(/\s/g, "_")
  }
});

// 📁 Gym-afbeeldingen
const gymStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "gym_images",
    format: async () => "png",
    public_id: (req, file) =>
      Date.now() + "-img-" + file.originalname.replace(/\s/g, "_")
  }
});

// 📁 Logo's van gyms
const logoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "gym_logos",
    format: async () => "png",
    public_id: (req, file) =>
      Date.now() + "-logo-" + file.originalname.replace(/\s/g, "_")
  }
});

// 📁 Video's (indien later nodig)
const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "exercise_videos",
    format: async () => "mp4",
    public_id: (req, file) =>
      Date.now() + "-video-" + file.originalname.replace(/\s/g, "_")
  }
});

// ✅ Multer middleware instances
const upload = multer({ storage: uploadStorage });               // Voor gebruikersprofiel
const gymUpload = multer({ storage: gymStorage });               // Algemene gym-afbeelding
const uploadLogo = multer({ storage: logoStorage }).single("logo");  // Één logo uploaden
const uploadImages = multer({ storage: gymStorage }).array("images", 5); // Max 5 afbeeldingen
const uploadImage = multer({ storage: gymStorage }).single("image");    // Eén afbeelding

// ✅ Gebruik dit voor upload van zowel logo als images in één formulier
const uploadGymFields = multer({ storage: gymStorage }).fields([
  { name: "logo", maxCount: 1 },
  { name: "images", maxCount: 5 }
]);

module.exports = {
  upload,             // voor gebruikersprofiel
  gymUpload,          // algemene gym uploads
  uploadLogo,         // logo upload
  uploadImage,        // enkele image upload
  uploadImages,       // meerdere images
  uploadGymFields     // voor formulier met zowel 'logo' als 'images'
};
