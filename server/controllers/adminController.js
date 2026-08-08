import User from '../models/userModel.js';
import Course from '../models/courseModel.js';
import Enrollment from '../models/enrollmentModel.js';
import Lab from '../models/labModel.js';
import Quiz from '../models/quizModel.js';
import Scenario from '../models/scenarioModel.js';
import Assignment from '../models/assignmentModel.js';
import Certificate from '../models/certificateModel.js';

export const getDashboardStats = async (req, res) => {
  const [users, courses, enrollments] = await Promise.all([
    User.countDocuments(),
    Course.countDocuments(),
    Enrollment.countDocuments(),
  ]);
  res.json({ users, courses, enrollments });
};

export const getAnalyticsOverview = async (req, res) => {
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

export const getUsers = async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
};

export const getCourses = async (req, res) => {
  const courses = await Course.find().populate('createdBy', 'firstName lastName').populate('category', 'name');
  res.json(courses);
};
