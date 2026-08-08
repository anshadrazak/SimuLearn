import Module from '../models/moduleModel.js';

export const createModule = async (req, res) => {
  const mod = await Module.create({ ...req.body, course: req.body.course });
  res.status(201).json(mod);
};

export const getModules = async (req, res) => {
  const mods = await Module.find({ course: req.params.courseId }).sort('sortOrder');
  res.json(mods);
};

export const getModule = async (req, res) => res.json(await Module.findById(req.params.id));

export const updateModule = async (req, res) => {
  const mod = await Module.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(mod);
};

export const deleteModule = async (req, res) => {
  await Module.findByIdAndDelete(req.params.id);
  res.json({ message: 'Module deleted' });
};

export const reorderModules = async (req, res) => {
  const { order } = req.body;
  await Promise.all(order.map((id, idx) => Module.findByIdAndUpdate(id, { sortOrder: idx })));
  res.json({ message: 'Reordered' });
};
