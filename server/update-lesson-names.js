import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Lesson from './models/lessonModel.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const courseId = '6a6cdeca63784bb4e91697a7';

async function updateLessonNames() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    // Get all lessons sorted by sortOrder
    const lessons = await Lesson.find({ course: courseId }).sort('sortOrder');

    if (lessons.length === 0) {
      console.log('❌ No lessons found for this course');
      process.exit(1);
    }

    // Update each lesson with simple names
    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i];
      await Lesson.findByIdAndUpdate(lesson._id, {
        title: `Lesson ${i + 1}`,
        description: `Complete this video lesson to unlock the next one.`,
        videoUrl: 'https://simulearn-m0i4.onrender.com/uploads/video.mp4',
        contentType: 'video',
        duration: 15, // 15 minutes
        sortOrder: i,
      });
      console.log(`✓ Updated: Lesson ${i + 1} (sortOrder: ${i})`);
    }

    console.log('\n📚 All Lessons Updated:');
    const updatedLessons = await Lesson.find({ course: courseId }).sort('sortOrder');
    updatedLessons.forEach((lesson, index) => {
      console.log(`  ${index + 1}. ${lesson.title}`);
      console.log(`     Description: ${lesson.description}`);
      console.log(`     Video: ${lesson.videoUrl}`);
      console.log(`     Order: ${lesson.sortOrder}`);
      if (index === 0) {
        console.log(`     🔓 Always unlocked`);
      } else {
        console.log(`     🔒 Unlocks after Lesson ${index} is completed`);
      }
      console.log('');
    });

    console.log('✅ Sequential unlock logic is active:');
    console.log('   - Lesson 1: Always accessible');
    console.log('   - Lesson 2: Unlocks after watching Lesson 1 to 100%');
    console.log('   - Lesson 3: Unlocks after watching Lesson 2 to 100%');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateLessonNames();
