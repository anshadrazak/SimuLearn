import Assignment from '../models/assignmentModel.js';
import Submission from '../models/submissionModel.js';
import { notifyGrading } from '../utils/notifications.js';

export const createAssignment = async (req, res) => res.status(201).json(await Assignment.create(req.body));
export const getAssignments = async (req, res) => res.json(await Assignment.find({ course: req.params.courseId }).sort('sortOrder'));
export const getAssignment = async (req, res) => res.json(await Assignment.findById(req.params.id));
export const updateAssignment = async (req, res) => res.json(await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true }));
export const deleteAssignment = async (req, res) => {
  await Assignment.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
};
export const gradeAssignment = async (req, res) => {
  const submission = await Submission.findByIdAndUpdate(req.params.id, {
    grade: req.body.grade,
    feedback: req.body.feedback,
    status: 'graded',
    gradedAt: new Date(),
    gradedBy: req.user._id,
  }, { new: true });
  if (submission) await notifyGrading(submission.student, submission.assignment, submission.grade);
  res.json(submission);
};
