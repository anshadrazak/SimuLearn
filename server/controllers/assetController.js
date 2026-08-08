import Asset from '../models/assetModel.js';
import { upload } from '../middlewares/uploadMiddleware.js';

export const uploadAsset = async (req, res) => {
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
  res.status(201).json(asset);
};

export const getAssets = async (req, res) => {
  const assets = await Asset.find().sort('-createdAt');
  res.json(assets);
};

export const deleteAsset = async (req, res) => {
  await Asset.findByIdAndDelete(req.params.id);
  res.json({ message: 'Asset deleted' });
};