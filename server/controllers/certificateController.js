import Certificate from '../models/certificateModel.js';
import Course from '../models/courseModel.js';

export const createCertificate = async (req, res) => {
  const data = { ...req.body, issuedBy: req.user._id };
  const certificate = await Certificate.create(data);
  res.status(201).json(certificate);
};

export const getCertificates = async (req, res) => {
  const certificates = await Certificate.find()
    .populate('course', 'title slug')
    .populate('recipient', 'firstName lastName email')
    .populate('issuedBy', 'firstName lastName')
    .sort('-createdAt');
  res.json(certificates);
};

export const getCertificate = async (req, res) => {
  const certificate = await Certificate.findById(req.params.id)
    .populate('course', 'title slug')
    .populate('recipient', 'firstName lastName email')
    .populate('issuedBy', 'firstName lastName');
  if (!certificate) return res.status(404).json({ message: 'Certificate not found' });
  res.json(certificate);
};

export const updateCertificate = async (req, res) => {
  const certificate = await Certificate.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!certificate) return res.status(404).json({ message: 'Certificate not found' });
  res.json(certificate);
};

export const deleteCertificate = async (req, res) => {
  const certificate = await Certificate.findByIdAndDelete(req.params.id);
  if (!certificate) return res.status(404).json({ message: 'Certificate not found' });
  res.json({ message: 'Certificate deleted' });
};

export const revokeCertificate = async (req, res) => {
  const certificate = await Certificate.findByIdAndUpdate(req.params.id, { isRevoked: true }, { new: true });
  if (!certificate) return res.status(404).json({ message: 'Certificate not found' });
  res.json(certificate);
};

export const getMyCertificates = async (req, res) => {
  const certificates = await Certificate.find({ recipient: req.user._id })
    .populate('course', 'title slug')
    .populate('issuedBy', 'firstName lastName')
    .sort('-createdAt');
  res.json(certificates);
};