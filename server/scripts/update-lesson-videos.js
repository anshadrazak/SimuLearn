import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Lesson from '../models/lessonModel.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const courseId = '6a6cdeca63784bb4e91697a7';

const videos = [
  'https://res.cloudinary.com/mqcelaho/video/upload/v1786296972/6313_Varanasi_India_1280x720.mp4',
  'https://res.cloudinary.com/mqcelaho/video/upload/v1786296966/7084_Money_Cash_1280x720.mp4',
  'https://res.cloudinary.com/mqcelaho/video/upload/v1786296940/457339_Llandudno_Beach_Llandudno_1280x720.mp4',
];

async function updateLessonVideos() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    const lessons = await Lesson.find({ course: courseId }).sort('sortOrder');
    console.log(`Found ${lessons.length} lessons`);

    for (let i = 0; i < Math.min(3, lessons.length); i++) {
      await Lesson.findByIdAndUpdate(lessons[i]._id, {
        videoUrl: videos[i],
        contentType: 'video',
      });
      console.log(`✓ Updated lesson ${i + 1}: ${lessons[i].title} -> ${videos[i]}`);
    }

    console.log('\n✅ Lesson videos updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateLessonVideos();
