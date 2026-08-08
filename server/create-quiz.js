import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Quiz from './models/quizModel.js';
import Question from './models/questionModel.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const courseId = '6a6cdeca63784bb4e91697a7';
const moduleId = '6a6cded063784bb4e91697aa';

async function createQuiz() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    // Create the quiz
    const quiz = await Quiz.create({
      title: 'Software Development Final Test',
      description: 'Test your knowledge after completing all video lessons.',
      course: courseId,
      module: moduleId,
      duration: 15,
      passingScore: 50,
      maxAttempts: 3,
      shuffleQuestions: false,
      showResults: true,
      showAnswers: true,
      isPublished: true
    });

    console.log('Quiz created:', quiz._id);

    // Create questions - 6 true/false questions, 5 marks each, total 30 marks
    const questions = [
      {
        quiz: quiz._id,
        question: 'A loop can be used to repeat a block of code multiple times.',
        type: 'true_false',
        options: ['true', 'false'],
        correctAnswer: 'true',
        points: 5,
        difficulty: 'easy',
        sortOrder: 0,
        isRequired: true
      },
      {
        quiz: quiz._id,
        question: 'Functions help organize code into reusable blocks.',
        type: 'true_false',
        options: ['true', 'false'],
        correctAnswer: 'true',
        points: 5,
        difficulty: 'easy',
        sortOrder: 1,
        isRequired: true
      },
      {
        quiz: quiz._id,
        question: 'Variables are used to store and manipulate data in programs.',
        type: 'true_false',
        options: ['true', 'false'],
        correctAnswer: 'true',
        points: 5,
        difficulty: 'easy',
        sortOrder: 2,
        isRequired: true
      },
      {
        quiz: quiz._id,
        question: 'Conditional statements like if-else help make decisions in code.',
        type: 'true_false',
        options: ['true', 'false'],
        correctAnswer: 'true',
        points: 5,
        difficulty: 'easy',
        sortOrder: 3,
        isRequired: true
      },
      {
        quiz: quiz._id,
        question: 'Arrays can store multiple values in a single variable.',
        type: 'true_false',
        options: ['true', 'false'],
        correctAnswer: 'true',
        points: 5,
        difficulty: 'easy',
        sortOrder: 4,
        isRequired: true
      },
      {
        quiz: quiz._id,
        question: 'Object-oriented programming uses objects to structure code.',
        type: 'true_false',
        options: ['true', 'false'],
        correctAnswer: 'true',
        points: 5,
        difficulty: 'easy',
        sortOrder: 5,
        isRequired: true
      }
    ];

    await Question.insertMany(questions);
    console.log(`✓ Created ${questions.length} questions for the quiz`);
    console.log('✓ Quiz setup complete!');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createQuiz();
