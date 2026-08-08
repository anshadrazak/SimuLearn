import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Quiz from '../models/quizModel.js';
import Question from '../models/questionModel.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const courseId = '6a6cdeca63784bb4e91697a7';

async function checkQuiz() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    const quizzes = await Quiz.find({ course: courseId });
    console.log(`\nFound ${quizzes.length} quiz(es) for this course:`);
    
    for (const quiz of quizzes) {
      console.log(`\n📝 Quiz: ${quiz.title} (${quiz._id})`);
      console.log(`   Passing Score: ${quiz.passingScore}%`);
      
      const questions = await Question.find({ quiz: quiz._id }).sort('sortOrder');
      console.log(`   Questions: ${questions.length}`);
      
      questions.forEach((q, i) => {
        console.log(`   ${i+1}. [${q.type}] ${q.question.substring(0, 70)}... (${q.points} marks)`);
        console.log(`      Answer: ${q.correctAnswer}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkQuiz();
