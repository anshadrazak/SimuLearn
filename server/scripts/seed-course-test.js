import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Quiz from '../models/quizModel.js';
import Question from '../models/questionModel.js';
import Lesson from '../models/lessonModel.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const courseId = '6a6cdeca63784bb4e91697a7';

async function seedCourseTest() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    const existingQuiz = await Quiz.findOne({ course: courseId, title: 'Course Test' });
    if (existingQuiz) {
      await Quiz.findByIdAndDelete(existingQuiz._id);
      await Question.deleteMany({ quiz: existingQuiz._id });
      console.log('✓ Removed existing test quiz');
    }

    const lessons = await Lesson.find({ course: courseId }).sort('sortOrder');
    const moduleId = lessons.length > 0 ? lessons[0].module : null;

    const quiz = await Quiz.create({
      title: 'Course Test',
      description: 'Test your knowledge after completing all lessons. 6 questions, 5 marks each. Passing score: 15/30 (50%).',
      course: courseId,
      module: moduleId,
      duration: 30,
      passingScore: 50,
      maxAttempts: 3,
      shuffleQuestions: true,
      showResults: true,
      showAnswers: true,
      isPublished: true,
    });

    console.log(`✓ Created quiz: ${quiz.title} (${quiz._id})`);

    const questions = [
      {
        type: 'true_false',
        question: 'The first lesson introduces the core concepts of the course.',
        options: ['True', 'False'],
        correctAnswer: 'True',
        points: 5,
        explanation: 'Correct! The first lesson always introduces the foundational concepts.',
        sortOrder: 0,
      },
      {
        type: 'true_false',
        question: 'Lessons must be completed sequentially in this course.',
        options: ['True', 'False'],
        correctAnswer: 'True',
        points: 5,
        explanation: 'Correct! Lessons are structured sequentially — each lesson unlocks after the previous one is completed.',
        sortOrder: 1,
      },
      {
        type: 'true_false',
        question: 'Video progress is automatically tracked as you watch each lesson.',
        options: ['True', 'False'],
        correctAnswer: 'True',
        points: 5,
        explanation: 'Correct! The system tracks your video progress automatically using timeupdate events.',
        sortOrder: 2,
      },
      {
        type: 'true_false',
        question: 'After completing all lessons, you become eligible to take the course test.',
        options: ['True', 'False'],
        correctAnswer: 'True',
        points: 5,
        explanation: 'Correct! After completing all lessons, the course test appears as a lesson in the sidebar.',
        sortOrder: 3,
      },
      {
        type: 'true_false',
        question: 'Each question in the course test is worth 5 marks.',
        options: ['True', 'False'],
        correctAnswer: 'True',
        points: 5,
        explanation: 'Correct! Each of the 6 questions is worth 5 marks, for a total of 30 marks.',
        sortOrder: 4,
      },
      {
        type: 'true_false',
        question: 'The minimum score required to pass the course test is 15 out of 30 marks (50%).',
        options: ['True', 'False'],
        correctAnswer: 'True',
        points: 5,
        explanation: 'Correct! The passing score is 50%, which equals 15 out of 30 marks.',
        sortOrder: 5,
      },
    ];

    const createdQuestions = [];
    for (const q of questions) {
      const question = await Question.create({ ...q, quiz: quiz._id });
      createdQuestions.push(question);
    }

    console.log(`✓ Created ${createdQuestions.length} questions for the quiz`);

    await Quiz.findByIdAndUpdate(quiz._id, {
      questions: createdQuestions.map(q => q._id),
    });

    console.log('\n✅ Course test seeded successfully!');
    console.log(`   Quiz: ${quiz.title}`);
    console.log(`   Questions: ${createdQuestions.length}`);
    console.log(`   Total Marks: 30`);
    console.log(`   Passing Score: 15/30 (50%)`);
    console.log(`   Quiz ID: ${quiz._id}`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seedCourseTest();