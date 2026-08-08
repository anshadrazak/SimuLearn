import Scenario from '../models/scenarioModel.js';
import ScenarioTask from '../models/scenarioTaskModel.js';
import ScenarioSubmission from '../models/scenarioSubmissionModel.js';
import Asset from '../models/assetModel.js';
import { upload } from '../middlewares/uploadMiddleware.js';

export const createScenario = async (req, res) => {
  const scenario = await Scenario.create(req.body);
  res.status(201).json(scenario);
};

export const getScenarios = async (req, res) => {
  const scenarios = await Scenario.find({ course: req.params.courseId }).sort('sortOrder');
  res.json(scenarios);
};

export const getAllScenarios = async (req, res) => {
  const scenarios = await Scenario.find().populate('course', 'title slug').sort('-createdAt');
  res.json(scenarios);
};

export const getScenario = async (req, res) => {
  const scenario = await Scenario.findById(req.params.id)
    .populate('evidenceFiles', 'filename originalName url mimetype size')
    .populate('attachments', 'filename originalName url mimetype size');
  res.json(scenario);
};

export const getFullScenario = async (req, res) => {
  const scenario = await Scenario.findById(req.params.id)
    .populate('evidenceFiles', 'filename originalName url mimetype size')
    .populate('attachments', 'filename originalName url mimetype size');
  if (!scenario) return res.status(404).json({ message: 'Scenario not found' });

  const tasks = await ScenarioTask.find({ scenario: req.params.id }).sort('sortOrder');
  res.json({ ...scenario.toObject(), tasks });
};

export const updateScenario = async (req, res) => {
  const scenario = await Scenario.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(scenario);
};

export const deleteScenario = async (req, res) => {
  await Scenario.findByIdAndDelete(req.params.id);
  await ScenarioTask.deleteMany({ scenario: req.params.id });
  res.json({ message: 'Scenario deleted' });
};

export const uploadEvidence = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const asset = await Asset.create({
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    path: req.file.path,
    url: `/uploads/${req.file.filename}`,
    uploadedBy: req.user._id,
  });
  const scenario = await Scenario.findById(req.params.id);
  scenario.evidenceFiles.push(asset._id);
  await scenario.save();
  res.status(201).json(asset);
};

export const removeEvidence = async (req, res) => {
  const scenario = await Scenario.findById(req.params.id);
  scenario.evidenceFiles = scenario.evidenceFiles.filter(id => id.toString() !== req.params.assetId);
  await scenario.save();
  res.json({ message: 'Evidence removed' });
};

export const addTask = async (req, res) => {
  const task = await ScenarioTask.create({ ...req.body, scenario: req.params.id });
  res.status(201).json(task);
};

export const getTasks = async (req, res) => {
  const tasks = await ScenarioTask.find({ scenario: req.params.id }).sort('sortOrder');
  res.json(tasks);
};

export const updateTask = async (req, res) => {
  const task = await ScenarioTask.findByIdAndUpdate(req.params.taskId, req.body, { new: true });
  res.json(task);
};

export const deleteTask = async (req, res) => {
  await ScenarioTask.findByIdAndDelete(req.params.taskId);
  res.json({ message: 'Task deleted' });
};

export const submitScenario = async (req, res) => {
  const scenario = await Scenario.findById(req.params.scenarioId);
  if (!scenario) return res.status(404).json({ message: 'Scenario not found' });

  const existing = await ScenarioSubmission.findOne({ student: req.user._id, scenario: req.params.scenarioId });
  const attemptNumber = existing ? existing.attemptNumber + 1 : 1;

  if (attemptNumber > scenario.maxAttempts) {
    return res.status(400).json({ message: 'Maximum attempts reached' });
  }

  let submission;
  if (existing) {
    submission = await ScenarioSubmission.findByIdAndUpdate(existing._id, {
      answers: req.body.answers || {},
      attachments: req.body.attachments || [],
      content: req.body.content,
      status: 'submitted',
      attemptNumber,
      submittedAt: new Date(),
    }, { new: true });
  } else {
    submission = await ScenarioSubmission.create({
      student: req.user._id,
      scenario: req.params.scenarioId,
      course: scenario.course,
      module: scenario.module,
      answers: req.body.answers || {},
      attachments: req.body.attachments || [],
      content: req.body.content,
      status: 'submitted',
      attemptNumber,
      submittedAt: new Date(),
    });
  }

  res.status(201).json(submission);
};

export const getScenarioSubmissions = async (req, res) => {
  const submissions = await ScenarioSubmission.find({ scenario: req.params.scenarioId })
    .populate('student', 'firstName lastName email')
    .sort('-submittedAt');
  res.json(submissions);
};

export const getMyScenarioSubmission = async (req, res) => {
  const submission = await ScenarioSubmission.findOne({ student: req.user._id, scenario: req.params.scenarioId })
    .populate('scenario', 'title maxAttempts passingScore');
  res.json(submission);
};

export const reviewScenarioSubmission = async (req, res) => {
  const submission = await ScenarioSubmission.findByIdAndUpdate(req.params.id, {
    status: req.body.status || 'reviewed',
    feedback: req.body.feedback,
    grade: req.body.grade,
    reviewedAt: new Date(),
    reviewedBy: req.user._id,
  }, { new: true });
  res.json(submission);
};

export const getMyScenarioSubmissions = async (req, res) => {
  const submissions = await ScenarioSubmission.find({ student: req.user._id })
    .populate('scenario', 'title backgroundStory')
    .populate('course', 'title')
    .sort('-submittedAt');
  res.json(submissions);
};

export const getScenarioProgress = async (req, res) => {
  const courseId = req.params.courseId;
  const scenarios = await Scenario.find({ course: courseId });
  const submissions = await ScenarioSubmission.find({ student: req.user._id, course: courseId });

  const submissionMap = new Map(submissions.map(s => [s.scenario.toString(), s]));

  const progress = scenarios.map(scenario => {
    const submission = submissionMap.get(scenario._id.toString());
    return {
      scenarioId: scenario._id,
      title: scenario.title,
      status: submission ? submission.status : 'not_started',
      attemptNumber: submission ? submission.attemptNumber : 0,
      grade: submission ? submission.grade : null,
      maxAttempts: scenario.maxAttempts,
    };
  });

  const completed = progress.filter(p => p.status === 'completed').length;
  res.json({
    total: scenarios.length,
    completed,
    progress,
  });
};