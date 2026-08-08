import Course from '../models/courseModel.js';
import Module from '../models/moduleModel.js';
import Lesson from '../models/lessonModel.js';
import { generateSlug } from '../utils/generateSlug.js';

export const createCourse = async (req, res) => {
  const data = { ...req.body, createdBy: req.user._id, slug: generateSlug(req.body.title) };
  const course = await Course.create(data);
  res.status(201).json(course);
};

export const getCourses = async (req, res) => {
  const { category, level, search } = req.query;
  const filter = { isPublished: true };
  if (category) filter.category = category;
  if (level) filter.level = level;
  if (search) filter.$text = { $search: search };

  const courses = await Course.find(filter).populate('createdBy', 'firstName lastName').populate('category', 'name');
  res.json(courses);
};

export const getCourse = async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate('createdBy', 'firstName lastName email')
    .populate('category', 'name');
  res.json(course);
};

export const getFullCourse = async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate('createdBy', 'firstName lastName email')
    .populate('category', 'name');
  if (!course) return res.status(404).json({ message: 'Course not found' });

  const modules = await Module.find({ course: req.params.id }).sort('sortOrder').lean();

  const modulesWithLessons = await Promise.all(
    modules.map(async (mod) => {
      const lessons = await Lesson.find({ module: mod._id, course: req.params.id })
        .sort('sortOrder')
        .populate('attachments')
        .populate('images')
        .lean();
      return { ...mod, lessons };
    })
  );

  res.json({ ...course.toObject(), modules: modulesWithLessons });
};

export const updateCourse = async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(course);
};

export const deleteCourse = async (req, res) => {
  await Course.findByIdAndDelete(req.params.id);
  res.json({ message: 'Course deleted' });
};

export const publishCourse = async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, { isPublished: true, status: 'published' }, { new: true });
  res.json(course);
};

export const getAdminCourses = async (req, res) => {
  const courses = await Course.find({ createdBy: req.user._id }).populate('category', 'name');
  res.json(courses);
};