import Role from '../models/roleModel.js';

export const createRole = async (req, res) => {
  const role = await Role.create(req.body);
  res.status(201).json(role);
};

export const getRoles = async (req, res) => {
  const roles = await Role.find().sort('name');
  res.json(roles);
};

export const getRole = async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) return res.status(404).json({ message: 'Role not found' });
  res.json(role);
};

export const updateRole = async (req, res) => {
  const role = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!role) return res.status(404).json({ message: 'Role not found' });
  res.json(role);
};

export const deleteRole = async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) return res.status(404).json({ message: 'Role not found' });
  if (role.isSystem) return res.status(400).json({ message: 'Cannot delete system role' });
  await Role.findByIdAndDelete(req.params.id);
  res.json({ message: 'Role deleted' });
};