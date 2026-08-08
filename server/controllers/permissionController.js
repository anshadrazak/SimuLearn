import Permission from '../models/permissionModel.js';

export const createPermission = async (req, res) => {
  const permission = await Permission.create(req.body);
  res.status(201).json(permission);
};

export const getPermissions = async (req, res) => {
  const permissions = await Permission.find().sort('name');
  res.json(permissions);
};

export const getPermission = async (req, res) => {
  const permission = await Permission.findById(req.params.id);
  if (!permission) return res.status(404).json({ message: 'Permission not found' });
  res.json(permission);
};

export const updatePermission = async (req, res) => {
  const permission = await Permission.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!permission) return res.status(404).json({ message: 'Permission not found' });
  res.json(permission);
};

export const deletePermission = async (req, res) => {
  const permission = await Permission.findByIdAndDelete(req.params.id);
  if (!permission) return res.status(404).json({ message: 'Permission not found' });
  res.json({ message: 'Permission deleted' });
};