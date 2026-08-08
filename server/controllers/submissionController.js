import Submission from '../models/submissionModel.js';

export const submitAssignment = async (req, res) => {
  const submission = await Submission.create({ student: req.user._id, ...req.body });
  res.status(201).json(submission);
};
export const getSubmissions = async (req, res) => res.json(await Submission.find({ assignment: req.params.assignmentId }).populate('student', 'firstName lastName email'));
export const getSubmission = async (req, res) => res.json(await Submission.findById(req.params.id));
export const deleteSubmission = async (req, res) => {
  await Submission.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
};
export const gradeSubmission = async (req, res) => {
  const submission = await Submission.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(submission);
};
