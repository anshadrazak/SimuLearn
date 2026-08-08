import QuestionBank from '../models/questionBankModel.js';
import Question from '../models/questionModel.js';

export const createQuestionBank = async (req, res) => {
  const bank = await QuestionBank.create(req.body);
  res.status(201).json(bank);
};

export const getQuestionBanks = async (req, res) => {
  const banks = await QuestionBank.find({ course: req.params.courseId }).populate('module', 'title');
  res.json(banks);
};

export const getQuestionBank = async (req, res) => {
  const bank = await QuestionBank.findById(req.params.id)
    .populate('module', 'title course');
  res.json(bank);
};

export const updateQuestionBank = async (req, res) => {
  const bank = await QuestionBank.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(bank);
};

export const deleteQuestionBank = async (req, res) => {
  await QuestionBank.findByIdAndDelete(req.params.id);
  await Question.deleteMany({ questionBank: req.params.id });
  res.json({ message: 'Question bank deleted' });
};

export const addQuestionToBank = async (req, res) => {
  const question = await Question.create({ ...req.body, questionBank: req.params.id });
  res.status(201).json(question);
};

export const removeQuestionFromBank = async (req, res) => {
  await Question.findByIdAndDelete(req.params.questionId);
  res.json({ message: 'Question removed from bank' });
};