import Lab from '../models/labModel.js';
import Asset from '../models/assetModel.js';
import { upload } from '../middlewares/uploadMiddleware.js';
import LabSubmission from '../models/labSubmissionModel.js';

export const createLab = async (req, res) => {
  const lab = await Lab.create(req.body);
  res.status(201).json(lab);
};

export const getLabs = async (req, res) => {
  const labs = await Lab.find({ course: req.params.courseId }).sort('sortOrder');
  res.json(labs);
};

export const getAllLabs = async (req, res) => {
  const labs = await Lab.find().populate('course', 'title slug').sort('-createdAt');
  res.json(labs);
};

export const getLab = async (req, res) => {
  const lab = await Lab.findById(req.params.id)
    .populate('starterFiles', 'filename originalName url mimetype size')
    .populate('solutionFiles', 'filename originalName url mimetype size')
    .populate('attachments', 'filename originalName url mimetype size');
  res.json(lab);
};

export const updateLab = async (req, res) => {
  const lab = await Lab.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(lab);
};

export const deleteLab = async (req, res) => {
  await Lab.findByIdAndDelete(req.params.id);
  res.json({ message: 'Lab deleted' });
};

export const uploadStarterFile = async (req, res) => {
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
  const lab = await Lab.findById(req.params.id);
  lab.starterFiles.push(asset._id);
  await lab.save();
  res.status(201).json(asset);
};

export const uploadSolutionFile = async (req, res) => {
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
  const lab = await Lab.findById(req.params.id);
  lab.solutionFiles.push(asset._id);
  await lab.save();
  res.status(201).json(asset);
};

export const removeStarterFile = async (req, res) => {
  const lab = await Lab.findById(req.params.id);
  lab.starterFiles = lab.starterFiles.filter(id => id.toString() !== req.params.assetId);
  await lab.save();
  res.json({ message: 'Starter file removed' });
};

export const removeSolutionFile = async (req, res) => {
  const lab = await Lab.findById(req.params.id);
  lab.solutionFiles = lab.solutionFiles.filter(id => id.toString() !== req.params.assetId);
  await lab.save();
  res.json({ message: 'Solution file removed' });
};

export const submitLab = async (req, res) => {
  const lab = await Lab.findById(req.params.labId);
  if (!lab) return res.status(404).json({ message: 'Lab not found' });

  const existingSubmission = await LabSubmission.findOne({ student: req.user._id, lab: req.params.labId });
  const attemptNumber = existingSubmission ? existingSubmission.attemptNumber + 1 : 1;

  if (attemptNumber > lab.maxAttempts) {
    return res.status(400).json({ message: 'Maximum attempts reached' });
  }

  let submission;
  if (existingSubmission) {
    submission = await LabSubmission.findByIdAndUpdate(existingSubmission._id, {
      attachments: req.body.attachments || [],
      content: req.body.content,
      status: 'submitted',
      attemptNumber,
      submittedAt: new Date(),
    }, { new: true });
  } else {
    submission = await LabSubmission.create({
      student: req.user._id,
      lab: req.params.labId,
      course: lab.course,
      module: lab.module,
      attachments: req.body.attachments || [],
      content: req.body.content,
      status: 'submitted',
      attemptNumber,
      submittedAt: new Date(),
    });
  }

  res.status(201).json(submission);
};

export const getLabSubmissions = async (req, res) => {
  const submissions = await LabSubmission.find({ lab: req.params.labId })
    .populate('student', 'firstName lastName email')
    .sort('-submittedAt');
  res.json(submissions);
};

export const getMyLabSubmission = async (req, res) => {
  const submission = await LabSubmission.findOne({ student: req.user._id, lab: req.params.labId })
    .populate('lab', 'title maxAttempts');
  res.json(submission);
};

export const reviewSubmission = async (req, res) => {
  const submission = await LabSubmission.findByIdAndUpdate(req.params.id, {
    status: req.body.status || 'reviewed',
    feedback: req.body.feedback,
    grade: req.body.grade,
    reviewedAt: new Date(),
    reviewedBy: req.user._id,
  }, { new: true });
  res.json(submission);
};

export const getMyLabSubmissions = async (req, res) => {
  const submissions = await LabSubmission.find({ student: req.user._id })
    .populate('lab', 'title scenario expectedOutput')
    .populate('course', 'title')
    .sort('-submittedAt');
  res.json(submissions);
};

export const getLabProgress = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const labs = await Lab.find({ course: courseId });
    const submissions = await LabSubmission.find({ student: req.user._id, course: courseId });

    const submissionMap = new Map(submissions.map(s => [s.lab.toString(), s]));

    const progress = labs.map(lab => {
      const submission = submissionMap.get(lab._id.toString());
      return {
        labId: lab._id,
        title: lab.title,
        status: submission ? submission.status : 'not_started',
        attemptNumber: submission ? submission.attemptNumber : 0,
        grade: submission ? submission.grade : null,
        maxAttempts: lab.maxAttempts,
      };
    });

    const completed = progress.filter(p => p.status === 'completed').length;
    res.json({
      total: labs.length,
      completed,
      progress,
    });
  } catch (error) {
    console.error('getLabProgress error:', error.message);
    res.status(500).json({ message: 'Failed to load progress' });
  }
};