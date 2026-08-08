export const enrollUser = async (studentId, courseId) => {
  const Enrollment = (await import('../models/enrollmentModel.js')).default;
  const enrollment = await Enrollment.create({ student: studentId, course: courseId });
  return enrollment;
};
