import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Quiz from './models/quizModel.js';
import Question from './models/questionModel.js';
import QuizAttempt from './models/quizAttemptModel.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

async function deleteQuiz() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    // Find the quiz by title
    const quiz = await Quiz.findOne({ title: 'Software Development Final Test' });
    
    if (quiz) {
      console.log('Found quiz:', quiz._id);
      
      // Delete all questions for this quiz
      const deletedQuestions = await Question.deleteMany({ quiz: quiz._id });
      console.log(`✓ Deleted ${deletedQuestions.deletedCount} questions`);
      
      // Delete all quiz attempts
      const deletedAttempts = await QuizAttempt.deleteMany({ quiz: quiz._id });
      console.log(`✓ Deleted ${deletedAttempts.deletedCount} quiz attempts`);
      
      // Delete the quiz itself
      await Quiz.findByIdAndDelete(quiz._id);
      console.log('✓ Deleted quiz');
      
      console.log('✓ Cleanup complete!');
    } else {
      console.log('No quiz found with that title');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

deleteQuiz();
