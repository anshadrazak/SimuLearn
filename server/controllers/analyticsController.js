import User from '../models/userModel.js';
import Course from '../models/courseModel.js';
import Enrollment from '../models/enrollmentModel.js';
import Lab from '../models/labModel.js';
import Quiz from '../models/quizModel.js';
import Scenario from '../models/scenarioModel.js';
import Assignment from '../models/assignmentModel.js';
import Certificate from '../models/certificateModel.js';
import LabSubmission from '../models/labSubmissionModel.js';
import QuizAttempt from '../models/quizAttemptModel.js';
import ScenarioSubmission from '../models/scenarioSubmissionModel.js';
import Submission from '../models/submissionModel.js';

export const getOverviewStats = async (req, res) => {
  const [users, courses, enrollments, labs, quizzes, scenarios, assignments, certificates] = await Promise.all([
    User.countDocuments(),
    Course.countDocuments(),
    Enrollment.countDocuments(),
    Lab.countDocuments(),
    Quiz.countDocuments(),
    Scenario.countDocuments(),
    Assignment.countDocuments(),
    Certificate.countDocuments(),
  ]);
  res.json({ users, courses, enrollments, labs, quizzes, scenarios, assignments, certificates });
};

export const getUserGrowth = async (req, res) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const growth = await User.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json(growth.map(g => ({ month: g._id, count: g.count })));
};

export const getCourseStats = async (req, res) => {
  const courses = await Course.aggregate([
    {
      $lookup: {
        from: 'enrollments',
        localField: '_id',
        foreignField: 'course',
        as: 'enrollments',
      },
    },
    {
      $project: {
        title: 1,
        enrollmentCount: { $size: '$enrollments' },
      },
    },
    { $sort: { enrollmentCount: -1 } },
  ]);

  res.json(courses);
};

export const getEngagementStats = async (req, res) => {
  const [labSubmissions, quizAttempts, scenarioSubmissions] = await Promise.all([
    LabSubmission.countDocuments(),
    QuizAttempt.countDocuments(),
    ScenarioSubmission.countDocuments(),
  ]);

  res.json({
    labSubmissions,
    quizAttempts,
    scenarioSubmissions,
    total: labSubmissions + quizAttempts + scenarioSubmissions,
  });
};

export const getTopPerformers = async (req, res) => {
  const performers = await QuizAttempt.aggregate([
    { $match: { finalGrade: { $exists: true, $ne: null } } },
    {
      $group: {
        _id: '$student',
        avgGrade: { $avg: '$finalGrade' },
        quizCount: { $sum: 1 },
      },
    },
    { $sort: { avgGrade: -1 } },
    { $limit: 10 },
  ]);

  const studentIds = performers.map(p => p._id);
  const students = await User.find({ _id: { $in: studentIds } }).select('firstName lastName email');

  const results = performers.map(p => {
    const student = students.find(s => s._id.toString() === p._id.toString());
    return {
      studentId: p._id,
      name: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
      email: student?.email || '',
      avgGrade: Math.round(p.avgGrade || 0),
      quizCount: p.quizCount,
    };
  });

  res.json(results);
};