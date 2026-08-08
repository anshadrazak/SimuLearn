import Enrollment from '../models/enrollmentModel.js';
import Assignment from '../models/assignmentModel.js';
import Submission from '../models/submissionModel.js';
import Course from '../models/courseModel.js';

export const getStudentDashboard = async (req, res) => {
  const studentId = req.user._id;

  const [enrollments, recentSubmissions] = await Promise.all([
    Enrollment.find({ student: studentId })
      .populate('course', 'title slug thumbnail createdBy status')
      .sort('-updatedAt'),
    Submission.find({ student: studentId })
      .populate('course', 'title slug')
      .populate('assignment', 'title dueDate')
      .sort('-submittedAt')
      .limit(20),
  ]);

  const enrolledCourseIds = enrollments.map(e => e.course?._id).filter(Boolean);

  const upcomingAssignments = enrolledCourseIds.length
    ? await Assignment.find({
        course: { $in: enrolledCourseIds },
        dueDate: { $gte: new Date() },
        isPublished: true,
      })
        .populate('course', 'title slug')
        .sort('dueDate')
        .limit(10)
    : [];

  const submittedAssignmentIds = await Submission.find({ student: studentId }).distinct('assignment');
  const upcomingAssignmentsFiltered = upcomingAssignments.filter(a => !submittedAssignmentIds.includes(a._id.toString()));

  const continueLearning = enrollments
    .filter(e => e.progress < 100 && e.status === 'active')
    .sort((a, b) => (b.progress || 0) - (a.progress || 0))
    .slice(0, 5);

  const progressData = enrollments.map(e => ({
    name: e.course?.title || 'Unknown',
    progress: e.progress || 0,
    status: e.status,
  }));

  res.json({
    myCourses: enrollments.map(e => ({
      _id: e._id,
      progress: e.progress,
      status: e.status,
      enrolledAt: e.enrolledAt,
      course: e.course,
    })),
    continueLearning: continueLearning.map(e => ({
      _id: e._id,
      progress: e.progress,
      status: e.status,
      course: e.course,
    })),
    recentActivity: recentSubmissions.map(s => ({
      _id: s._id,
      status: s.status,
      submittedAt: s.submittedAt,
      course: s.course,
      assignment: s.assignment,
    })),
    upcomingAssignments: upcomingAssignmentsFiltered.map(a => ({
      _id: a._id,
      title: a.title,
      dueDate: a.dueDate,
      course: a.course,
    })),
    progressData,
  });
};