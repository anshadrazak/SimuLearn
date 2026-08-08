import Lesson from '../models/lessonModel.js';
import Progress from '../models/progressModel.js';

export const createLesson = async (req, res) => {
  const lesson = await Lesson.create(req.body);
  res.status(201).json(lesson);
};

export const getLessons = async (req, res) => {
  const lessons = await Lesson.find({ module: req.params.moduleId }).sort('sortOrder');
  res.json(lessons);
};

export const getLesson = async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

  const allLessons = await Lesson.find({ course: lesson.course }).sort('sortOrder');
  const lessonIndex = allLessons.findIndex(l => l._id.toString() === req.params.id);

  if (lessonIndex > 0) {
    const previousLesson = allLessons[lessonIndex - 1];
    const prevProgress = await Progress.findOne({
      student: req.user._id,
      lesson: previousLesson._id,
      completed: true,
    });
    if (!prevProgress) {
      return res.status(403).json({ message: 'Complete the previous lesson to unlock this one' });
    }
  }

  res.json(lesson);
};

export const updateLesson = async (req, res) => {
  res.json(await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true }));
};

export const deleteLesson = async (req, res) => {
  await Lesson.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
};

export const reorderLessons = async (req, res) => {
  const { order } = req.body;
  await Promise.all(order.map((id, idx) => Lesson.findByIdAndUpdate(id, { sortOrder: idx })));
  res.json({ message: 'Reordered' });
};