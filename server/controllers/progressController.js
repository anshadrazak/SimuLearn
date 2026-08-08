import Progress from '../models/progressModel.js';
import Lesson from '../models/lessonModel.js';
import Enrollment from '../models/enrollmentModel.js';

export const trackVideoProgress = async (req, res) => {
  const { lessonId } = req.params;
  const { videoProgress, watchedDuration } = req.body;
  const studentId = req.user._id;

  const lesson = await Lesson.findById(lessonId);
  if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

  let progress = await Progress.findOne({ student: studentId, lesson: lessonId });

  if (!progress) {
    progress = await Progress.create({
      student: studentId,
      course: lesson.course,
      lesson: lessonId,
      videoProgress: videoProgress || 0,
      watchedDuration: watchedDuration || 0,
      completed: videoProgress >= 100,
    });
  } else {
    progress.videoProgress = videoProgress ?? progress.videoProgress;
    progress.watchedDuration = watchedDuration ?? progress.watchedDuration;
    progress.completed = videoProgress >= 100 ? true : progress.completed;
    progress.viewedAt = new Date();
    await progress.save();
  }

  if (videoProgress >= 100) {
    await updateEnrollmentProgress(studentId, lesson.course);
  }

  res.json(progress);
};

export const getLessonProgress = async (req, res) => {
  const { lessonId } = req.params;
  const progress = await Progress.findOne({ student: req.user._id, lesson: lessonId });
  res.json(progress || { completed: false, videoProgress: 0, watchedDuration: 0 });
};

export const getCourseProgress = async (req, res) => {
  const { courseId } = req.params;
  const progress = await Progress.find({ student: req.user._id, course: courseId }).populate('lesson', 'title sortOrder');
  res.json(progress);
};

const updateEnrollmentProgress = async (studentId, courseId) => {
  const lessons = await Lesson.find({ course: courseId });
  const totalLessons = lessons.length;
  if (totalLessons === 0) return;

  const completedCount = await Progress.countDocuments({
    student: studentId,
    lesson: { $in: lessons.map(l => l._id) },
    completed: true,
  });

  const progressPercent = Math.round((completedCount / totalLessons) * 100);

  const enrollment = await Enrollment.findOne({ student: studentId, course: courseId });
  if (enrollment) {
    enrollment.progress = progressPercent;
    if (progressPercent >= 100) {
      enrollment.status = 'completed';
      enrollment.completedAt = new Date();
    }
    await enrollment.save();
  }
};

export const checkLessonUnlock = async (req, res) => {
  const { lessonId } = req.params;
  const lesson = await Lesson.findById(lessonId).populate('course');
  if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

  const allLessons = await Lesson.find({ course: lesson.course }).sort('sortOrder');
  const lessonIndex = allLessons.findIndex(l => l._id.toString() === lessonId.toString());

  if (lessonIndex <= 0) {
    return res.json({ unlocked: true });
  }

  const previousLesson = allLessons[lessonIndex - 1];
  const prevProgress = await Progress.findOne({
    student: req.user._id,
    lesson: previousLesson._id,
    completed: true,
  });

  res.json({ unlocked: !!prevProgress });
};