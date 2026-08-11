import express from 'express';
import Lesson from '../models/lessonModel.js';

const router = express.Router();

// Update lesson videos to Cloudinary URLs
router.post('/update-videos', async (req, res) => {
  try {
    const cloudinaryVideos = [
      'https://res.cloudinary.com/mqcelaho/video/upload/v1786296972/6313_Varanasi_India_1280x720.mp4',
      'https://res.cloudinary.com/mqcelaho/video/upload/v1786296966/7084_Money_Cash_1280x720.mp4',
      'https://res.cloudinary.com/mqcelaho/video/upload/v1786296940/457339_Llandudno_Beach_Llandudno_1280x720.mp4'
    ];

    // Get all lessons with video content
    const lessons = await Lesson.find({ contentType: 'video' }).sort({ sortOrder: 1 });
    
    if (lessons.length === 0) {
      return res.status(404).json({ message: 'No video lessons found' });
    }

    const updates = [];
    
    // Update lessons with Cloudinary URLs
    for (let i = 0; i < Math.min(lessons.length, cloudinaryVideos.length); i++) {
      const lesson = lessons[i];
      const oldUrl = lesson.videoUrl;
      const newUrl = cloudinaryVideos[i];
      
      lesson.videoUrl = newUrl;
      await lesson.save();
      
      updates.push({
        id: lesson._id,
        title: lesson.title,
        oldUrl,
        newUrl
      });
    }

    res.json({
      success: true,
      message: `Updated ${updates.length} lesson videos`,
      updates
    });
  } catch (error) {
    console.error('Error updating videos:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get current lesson videos
router.get('/videos', async (req, res) => {
  try {
    const lessons = await Lesson.find({ contentType: 'video' })
      .select('title videoUrl contentType sortOrder')
      .sort({ sortOrder: 1 });
    
    res.json({
      success: true,
      count: lessons.length,
      lessons
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
