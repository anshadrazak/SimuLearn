import pdf from 'pdfkit';
import fs from 'fs';

export const generateCertificate = async (enrollment) => {
  const doc = new pdf();
  const path = `certificates/${enrollment._id}.pdf`;
  doc.pipe(fs.createWriteStream(path));
  doc.text(`Certificate of Completion for ${enrollment.course.name}`);
  doc.end();
  return path;
};

export const issueCertificate = async (enrollment) => {
  if (enrollment.certificateIssued) return enrollment.certificateUrl;
  const url = await generateCertificate(enrollment);
  enrollment.certificateUrl = url;
  enrollment.certificateIssued = true;
  await enrollment.save();
  return url;
};
