import Category from '../models/categoryModel.js';

export const createCategory = async (req, res) => res.status(201).json(await Category.create(req.body));
export const getCategories = async (req, res) => res.json(await Category.find().sort('sortOrder'));
export const getCategory = async (req, res) => res.json(await Category.findById(req.params.id));
export const updateCategory = async (req, res) => res.json(await Category.findByIdAndUpdate(req.params.id, req.body, { new: true }));
export const deleteCategory = async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
};
