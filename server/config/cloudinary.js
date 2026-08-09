import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadVideoToCloudinary = async (filePath, folder = 'lms/videos') => {
  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: 'video',
    folder,
    transformation: [
      { width: 1280, crop: 'limit', quality: 'auto' },
    ],
  });
  return result;
};

export const deleteFromCloudinary = async (publicId) => {
  await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
};

export default cloudinary;
