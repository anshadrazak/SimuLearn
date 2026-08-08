import Enrollment from '../models/enrollmentModel.js';
import { enrollUser } from '../utils/enrollment.js';

export const enroll = async (req, res) => {
  const enrollment = await enrollUser(req.user._id, req.params.courseId);
  res.status(201).json(enrollment);
};

export const unenroll = async (req, res) => {
  await Enrollment.findOneAndDelete({ student: req.user._id, course: req.params.courseId });
  res.json({ message: 'Unenrolled' });
};

export const getMyEnrollments = async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id }).populate('course', 'title slug thumbnail createdBy');
  res.json(enrollments);
};

export const getCourseEnrollments = async (req, res) => {
  const enrollments = await Enrollment.find({ course: req.params.courseId }).populate('student', 'firstName lastName email');
  res.json(enrollments);
};

export const getEnrollment = async (req, res) => res.json(await Enrollment.findById(req.params.id));

export const updateProgress = async (req, res) => {
  const enrollment = await Enrollment.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(enrollment);
};
