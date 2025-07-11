const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// 📁 Logo-opslag
const logoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "gym_logos",
    format: async () => "png",
    public_id: (req, file) =>
      Date.now() + "-logo-" + file.originalname.replace(/\s/g, "_")
  }
});

// 📁 Gallery afbeeldingen opslag
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "gym_images",
    format: async () => "png",
    public_id: (req, file) =>
      Date.now() + "-img-" + file.originalname.replace(/\s/g, "_")
  }
});

// 🎯 Enige juiste gecombineerde upload voor logo + images
const uploadFields = multer({
  storage: function (req, file, cb) {
    if (file.fieldname === "logo") return cb(null, logoStorage);
    if (file.fieldname === "images") return cb(null, imageStorage);
    return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
  }
}).fields([
  { name: "logo", maxCount: 1 },
  { name: "images", maxCount: 5 }
]);

module.exports = {
  uploadFields // ✅ gebruik enkel deze in je routes
};
