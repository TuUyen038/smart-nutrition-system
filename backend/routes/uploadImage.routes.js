// routes/upload.routes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const type = req.query.type || "general";
    const folderName = {
      recipe: "foodImages",
      ingredient: "ingredientImages",
      avatar: "userAvatars",
    }[type] || "generalImages";

    return {
      folder: folderName,
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ quality: "auto", fetch_format: "auto" }], // tối ưu ảnh
    };
  },
});

const upload = multer({ storage });

// Route upload ảnh
router.post("/", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Không có file nào được tải lên" });
  }

  res.status(200).json({
    message: "Upload thành công",
    url: req.file.path,          
    public_id: req.file.filename 
  });
});

module.exports = router;
