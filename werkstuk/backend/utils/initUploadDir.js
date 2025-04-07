const fs = require("fs");
const path = require("path");

exports.initUploadDir = () => {
  const uploadDir = path.join(__dirname, "../uploads");

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("📁 Upload directory created at:", uploadDir);
  } else {
    console.log("📁 Upload directory already exists.");
  }
};
