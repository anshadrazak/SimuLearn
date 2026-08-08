import mongoose from 'mongoose';
import Quiz from '../models/quizModel.js';
import Question from '../models/questionModel.js';
import QuestionBank from '../models/questionBankModel.js';
import QuizAttempt from '../models/quizAttemptModel.js';
import User from '../models/userModel.js';

export const createQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.create(req.body);
    res.status(201).json(quiz);
  } catch (error) {
    console.error('Error in createQuiz:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(quiz);
  } catch (error) {
    console.error('Error in updateQuiz:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteQuiz = async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    await Question.deleteMany({ quiz: req.params.id });
    res.json({ message: 'Deleted' });
  } catch (error) {
    console.error('Error in deleteQuiz:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const addQuestion = async (req, res) => {
  try {
    const question = await Question.create({ ...req.body, quiz: req.params.id });
    res.status(201).json(question);
  } catch (error) {
    console.error('Error in addQuestion:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.questionId, req.body, { new: true });
    res.json(question);
  } catch (error) {
    console.error('Error in updateQuestion:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.questionId);
    res.json({ message: 'Question deleted' });
  } catch (error) {
    console.error('Error in deleteQuestion:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ course: req.params.courseId }).populate('module', 'title').lean();
    res.json(quizzes);
  } catch (error) {
    console.error('Error in getQuizzes:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate('course', 'title slug').populate('module', 'title').sort('-createdAt').lean();
    res.json(quizzes);
  } catch (error) {
    console.error('Error in getAllQuizzes:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('module', 'title course').lean();
    res.json(quiz);
  } catch (error) {
    console.error('Error in getQuiz:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getQuizWithQuestions = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('module', 'title course').lean();
    const questions = await Question.find({ quiz: req.params.id }).sort('sortOrder').lean();
    res.json({ ...quiz, questions });
  } catch (error) {
    console.error('Error in getQuizWithQuestions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const startQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).lean();
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const existing = await QuizAttempt.findOne({ student: req.user._id, quiz: req.params.id, completedAt: { $exists: true } });

    if (existing) {
      return res.status(400).json({ message: 'Test already completed', attempt: existing.toObject() });
    }

    let questions = await Question.find({ quiz: req.params.id }).sort('sortOrder').lean();

    if (quiz.shuffleQuestions) {
      questions = questions.sort(() => Math.random() - 0.5);
    }

    if (quiz.isQuestionBank && quiz.questionsPerAttempt) {
      const bankQuestionsCount = await Question.countDocuments({ questionBank: { $in: quiz.questionBanks } });
      const takeCount = Math.min(quiz.questionsPerAttempt, bankQuestionsCount);
      questions = await Question.aggregate([
        { $match: { questionBank: { $in: quiz.questionBanks.map(id => mongoose.Types.ObjectId(id)) } } },
        { $sample: { size: takeCount } },
      ]);
    }

    const questionIds = questions.map(q => q._id);

    const attempt = await QuizAttempt.create({
      student: req.user._id,
      quiz: req.params.id,
      course: quiz.course,
      questions: questionIds,
      startedAt: new Date(),
    });

    res.status(201).json({ attempt: attempt.toObject(), quiz, questions });
  } catch (error) {
    console.error('Error in startQuiz:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const existingAttempt = await QuizAttempt.findOne({
      student: req.user._id,
      quiz: req.params.id,
      completedAt: { $exists: true }
    });

    if (existingAttempt) {
      return res.status(400).json({ message: 'Test already completed', attempt: existingAttempt.toObject() });
    }

    const attempt = await QuizAttempt.findOne({ student: req.user._id, quiz: req.params.id });

    let savedAttempt;
    if (attempt) {
      savedAttempt = await QuizAttempt.findByIdAndUpdate(attempt._id, {
        answers: req.body.answers || {},
        completedAt: new Date(),
        timeSpent: req.body.timeSpent,
      }, { new: true });
    } else {
      savedAttempt = await QuizAttempt.create({
        student: req.user._id,
        quiz: req.params.id,
        course: quiz.course,
        questions: req.body.questions || [],
        answers: req.body.answers || {},
        completedAt: new Date(),
        timeSpent: req.body.timeSpent,
      });
    }

    try {
      await scoreQuiz(savedAttempt._id);
      const scored = await QuizAttempt.findById(savedAttempt._id).lean();
      res.json(scored);
    } catch (error) {
      console.error('Error scoring quiz:', error);
      res.json(savedAttempt.toObject ? savedAttempt.toObject() : savedAttempt);
    }
  } catch (error) {
    console.error('Error in submitQuiz:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ student: req.user._id, quiz: req.params.id, completedAt: { $exists: true } })
      .sort('-completedAt');
    res.json(attempts.map(a => a.toObject ? a.toObject() : a));
  } catch (error) {
    console.error('Error in getMyAttempts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getQuizAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ quiz: req.params.id, completedAt: { $exists: true } })
      .populate('student', 'firstName lastName email')
      .sort('-completedAt');
    res.json(attempts);
  } catch (error) {
    console.error('Error in getQuizAttempts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const gradeQuiz = async (req, res) => {
  try {
    const attempt = await QuizAttempt.findById(req.params.id);
    if (!attempt) return res.status(404).json({ message: 'Attempt not found' });

    attempt.manualGrade = req.body.manualGrade;
    attempt.isGraded = true;
    attempt.reviewedBy = req.user._id;
    attempt.feedback = req.body.feedback;
    await attempt.save();

    await recalculateFinalGrade(attempt._id);
    const updated = await QuizAttempt.findById(attempt._id).lean();
    res.json(updated);
  } catch (error) {
    console.error('Error in gradeQuiz:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyQuizResults = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ student: req.user._id, completedAt: { $exists: true } })
      .populate('quiz', 'title course')
      .populate('course', 'title')
      .sort('-completedAt');
    res.json(attempts.map(a => a.toObject ? a.toObject() : a));
  } catch (error) {
    console.error('Error in getMyQuizResults:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getQuizResults = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ quiz: req.params.id, completedAt: { $exists: true } })
      .populate('student', 'firstName lastName email')
      .sort('-completedAt');
    res.json(attempts.map(a => a.toObject ? a.toObject() : a));
  } catch (error) {
    console.error('Error in getQuizResults:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ quiz: req.params.id, completedAt: { $exists: true } })
      .populate('student', 'firstName lastName email avatar')
      .sort({ finalGrade: -1, completedAt: 1 });

    const leaderboard = attempts.map((a, idx) => ({
      rank: idx + 1,
      student: a.student ? (a.student.toObject ? a.student.toObject() : a.student) : null,
      score: a.finalGrade || a.score,
      completedAt: a.completedAt,
    }));

    res.json(leaderboard);
  } catch (error) {
    console.error('Error in getLeaderboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCourseLeaderboard = async (req, res) => {
  try {
    const { courseId } = req.params;
    const quizzes = await Quiz.find({ course: courseId, isPublished: true }).select('_id');
    const quizIds = quizzes.map(q => q._id);

    if (quizIds.length === 0) {
      return res.json([]);
    }

    const attempts = await QuizAttempt.aggregate([
      { $match: { quiz: { $in: quizIds }, completedAt: { $exists: true } } },
      { $group: {
        _id: '$student',
        avgScore: { $avg: '$finalGrade' },
        totalQuizzes: { $sum: 1 },
        passedQuizzes: { $sum: { $cond: [{ $gte: ['$finalGrade', 70] }, 1, 0] } },
      }},
      { $sort: { avgScore: -1 } },
      { $limit: 50 },
    ]);

    const studentIds = attempts.map(a => a._id);
    const users = await User.find({ _id: { $in: studentIds } }).select('firstName lastName email avatar');

    const leaderboard = attempts.map((a, idx) => {
      const user = users.find(u => u._id.toString() === a._id.toString());
      return {
        rank: idx + 1,
        student: user ? (user.toObject ? user.toObject() : user) : null,
        avgScore: Math.round(a.avgScore || 0),
        totalQuizzes: a.totalQuizzes,
        passedQuizzes: a.passedQuizzes,
      };
    });

    res.json(leaderboard);
  } catch (error) {
    console.error('Error in getCourseLeaderboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const scoreQuiz = async (attemptId) => {
  const attempt = await QuizAttempt.findById(attemptId).populate('quiz');
  if (!attempt || attempt.isGraded) return;

  const questions = await Question.find({ _id: { $in: attempt.questions } });
  let totalPoints = 0;
  let earnedPoints = 0;
  let requiresReview = false;

  for (const q of questions) {
    totalPoints += q.points;
    const studentAnswer = attempt.answers?.[q._id.toString()];

    if (q.type === 'multiple_choice') {
      if (studentAnswer === q.correctAnswer) earnedPoints += q.points;
    } else if (q.type === 'multiple_select') {
      if (Array.isArray(studentAnswer) && Array.isArray(q.correctAnswer)) {
        const sortedStudent = [...studentAnswer].sort();
        const sortedCorrect = [...q.correctAnswer].sort();
        if (JSON.stringify(sortedStudent) === JSON.stringify(sortedCorrect)) {
          earnedPoints += q.points;
        }
      }
    } else if (q.type === 'true_false') {
      if (String(studentAnswer) === String(q.correctAnswer)) earnedPoints += q.points;
    } else if (q.type === 'code') {
      earnedPoints += q.points;
      requiresReview = true;
    } else if (q.type === 'essay') {
      requiresReview = true;
    } else if (q.type === 'drag_drop' || q.type === 'matching') {
      if (JSON.stringify(studentAnswer) === JSON.stringify(q.correctAnswer)) {
        earnedPoints += q.points;
      }
    }
  }

  const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const passingScore = attempt.quiz?.passingScore || 70;

  await QuizAttempt.findByIdAndUpdate(attemptId, {
    totalPoints,
    score,
    finalGrade: score,
    passed: score >= passingScore,
    requiresReview,
    isGraded: !requiresReview,
  });
};

const recalculateFinalGrade = async (attemptId) => {
  const attempt = await QuizAttempt.findById(attemptId);
  if (!attempt) return;

  const autoScore = attempt.score || 0;
  const manualScore = attempt.manualGrade;

  if (manualScore !== undefined && manualScore !== null) {
    const finalGrade = Math.round((autoScore + manualScore) / 2);
    await QuizAttempt.findByIdAndUpdate(attemptId, { finalGrade });
  } else {
    await QuizAttempt.findByIdAndUpdate(attemptId, { finalGrade: autoScore });
  }
};