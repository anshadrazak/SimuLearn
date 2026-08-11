import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Lesson from '../models/lessonModel.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const cloudinaryVideos = [
  'https://res.cloudinary.com/mqcelaho/video/upload/v1786296972/6313_Varanasi_India_1280x720.mp4',
  'https://res.cloudinary.com/mqcelaho/video/upload/v1786296966/7084_Money_Cash_1280x720.mp4',
  'https://res.cloudinary.com/mqcelaho/video/upload/v1786296940/457339_Llandudno_Beach_Llandudno_1280x720.mp4'
];

async function updateLessonVideos() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lms-platform');
    console.log('MongoDB connected');

    // Get all lessons with video content
    const lessons = await Lesson.find({ contentType: 'video' }).sort({ sortOrder: 1 });
    
    console.log(`\nFound ${lessons.length} video lessons`);
    
    if (lessons.length === 0) {
      console.log('No video lessons found in database');
      process.exit(0);
    }

    console.log('\nCurrent lesson videos:');
    lessons.forEach((lesson, index) => {
      console.log(`${index + 1}. ${lesson.title}: ${lesson.videoUrl}`);
    });

    // Update lessons with Cloudinary URLs
    console.log('\n--- Updating lesson videos ---');
    for (let i = 0; i < Math.min(lessons.length, cloudinaryVideos.length); i++) {
      const lesson = lessons[i];
      const newVideoUrl = cloudinaryVideos[i];
      
      lesson.videoUrl = newVideoUrl;
      await lesson.save();
      
      console.log(`✓ Updated "${lesson.title}"\n  New URL: ${newVideoUrl}`);
    }

    console.log('\n✓ All lesson videos updated successfully!');
    
    // Display updated lessons
    console.log('\nUpdated lesson videos:');
    const updatedLessons = await Lesson.find({ contentType: 'video' }).sort({ sortOrder: 1 });
    updatedLessons.forEach((lesson, index) => {
      console.log(`${index + 1}. ${lesson.title}: ${lesson.videoUrl}`);
    });

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error updating lesson videos:', error);
    process.exit(1);
  }
}

updateLessonVideos();
