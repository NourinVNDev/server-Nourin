import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

export const uploadToCloudinary = async (file: Express.Multer.File): Promise<any> => {
  try {
    // Upload file directly using buffer to Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: 'image' }, // Specify resource type for image files
        (error, result) => {
          if (error) {
            reject("Cloudinary upload failed: " + error.message);
          } else {
            resolve(result);
          }
        }
      ).end(file.buffer); // Upload the file buffer
    });

    return result.secure_url; // Return Cloudinary URL
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);
    throw new Error("File upload to Cloudinary failed.");
  }
};

export default cloudinary;
