const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// 📁 Uploads van gebruikers
const uploadStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "user_uploads",
    format: async () => "png",
    public_id: (req, file) =>
      Date.now() + "-" + file.originalname.replace(/\s/g, "_")
  }
});

// 📁 Galerijafbeeldingen van gyms
const gymStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "gym_images",
    format: async () => "png",
    public_id: (req, file) =>
      Date.now() + "-" + file.originalname.replace(/\s/g, "_")
  }
});

// 📁 Logo's van gyms
const logoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "gym_logos",
    format: async () => "png",
    public_id: (req, file) =>
      Date.now() + "-" + file.originalname.replace(/\s/g, "_")
  }
});

// 👇 Combineert uploads van logo (1x) en images (max 5x)
const uploadFields = multer({
  storage: (req, file, cb) => {
    if (file.fieldname === "logo") return cb(null, logoStorage);
    if (file.fieldname === "images") return cb(null, gymStorage);
    return cb(new Error("Unexpected field: " + file.fieldname));
  }
}).fields([
  { name: "logo", maxCount: 1 },
  { name: "images", maxCount: 5 }
]);

module.exports = {
  upload: multer({ storage: uploadStorage }),
  gymUpload: multer({ storage: gymStorage }),
  uploadLogo: multer({ storage: logoStorage }),
  uploadImage: multer({ storage: gymStorage }).single("image"),
  uploadImages: multer({ storage: gymStorage }).array("images", 5),
  uploadFields // ✅ gebruik deze in je route
};
