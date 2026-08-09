import cloudinary from '../config/cloudinary.js';

export const uploadVideo = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No video file uploaded' });

  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: 'lms/videos',
          transformation: [
            { width: 1280, crop: 'limit', quality: 'auto' },
          ],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    res.status(201).json({
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      bytes: result.bytes,
      duration: result.duration,
    });
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    res.status(500).json({ message: 'Failed to upload video to Cloudinary' });
  }
};

export const deleteVideo = async (req, res) => {
  try {
    await cloudinary.uploader.destroy(req.params.publicId, { resource_type: 'video' });
    res.json({ message: 'Video deleted from Cloudinary' });
  } catch (err) {
    console.error('Cloudinary delete error:', err);
    res.status(500).json({ message: 'Failed to delete video from Cloudinary' });
  }
};
