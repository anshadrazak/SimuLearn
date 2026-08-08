import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Lesson from './models/lessonModel.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const courseId = '6a6cdeca63784bb4e91697a7';

async function updateLessonVideos() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    const lessons = await Lesson.find({ course: courseId }).sort('sortOrder');

    const videoMap = {
      0: 'http://localhost:5000/uploads/lesson1.mp4',
      1: 'http://localhost:5000/uploads/lesson2.mp4',
      2: 'http://localhost:5000/uploads/lesson3.mp4',
    };

    for (const lesson of lessons) {
      const videoUrl = videoMap[lesson.sortOrder] || `http://localhost:5000/uploads/lesson${lesson.sortOrder + 1}.mp4`;
      await Lesson.findByIdAndUpdate(lesson._id, {
        videoUrl,
        contentType: 'video',
      });
      console.log(`✓ Updated: ${lesson.title} → ${videoUrl}`);
    }

    console.log('\n📚 All Lessons Updated:');
    const updatedLessons = await Lesson.find({ course: courseId }).sort('sortOrder');
    updatedLessons.forEach((lesson, index) => {
      console.log(`  ${index + 1}. ${lesson.title}`);
      console.log(`     Video: ${lesson.videoUrl}`);
      console.log(`     Order: ${lesson.sortOrder}`);
      if (index === 0) {
        console.log(`     🔓 Always unlocked`);
      } else {
        console.log(`     🔒 Unlocks after Lesson ${index} is completed`);
      }
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateLessonVideos();
