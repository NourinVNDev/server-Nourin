



import multer from "multer";
import path from "path";
import fs from "fs";

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir); // Use absolute path
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Ensure unique filenames
  },
});

const upload = multer({ storage });
export default upload;

// import multer from 'multer';

// import { CloudinaryStorage } from 'multer-storage-cloudinary';
// import cloudinary from './config/cloudinaryConfig';
// import dotenv from 'dotenv';

// dotenv.config();

// // Configure Multer to use Cloudinary storage
// const storage = new CloudinaryStorage({
//   cloudinary:cloudinary,
//   params: async (req, file) => ({
//     folder: 'uploads',
//     format: file.mimetype.split('/')[1], // Dynamically set the format
//   })
  
// });
// console.log('Try it ');

// // Multer middleware
// const upload = multer({ storage });

// export default  upload;



