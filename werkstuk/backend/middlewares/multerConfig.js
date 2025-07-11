const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const uploadStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "user_uploads",
    format: async () => "png",
    public_id: (req, file) => Date.now() + "-" + file.originalname.replace(/\s/g, "_")
  }
});

const gymStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "gym_images",
    format: async () => "png",
    public_id: (req, file) => Date.now() + "-" + file.originalname.replace(/\s/g, "_")
  }
});

const logoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "gym_logos",
    format: async () => "png",
    public_id: (req, file) => Date.now() + "-" + file.originalname.replace(/\s/g, "_")
  }
});

const upload = multer({ storage: uploadStorage });
const gymUpload = multer({ storage: gymStorage });
const uploadLogo = multer({ storage: logoStorage });
const uploadImage = multer({ storage: gymStorage }).single("image");
const uploadImages = multer({ storage: gymStorage }).array("images", 5);

module.exports = {
  upload,
  gymUpload,
  uploadLogo,
  uploadImage,
  uploadImages,
  
};
