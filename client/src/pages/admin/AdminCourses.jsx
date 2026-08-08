import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseApi } from '../../services/courseApi';

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    courseApi.getAdminCourses().then(res => {
      setCourses(res.data);
      setLoading(false);
    });
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this course?')) return;
    await courseApi.deleteCourse(id);
    setCourses(courses.filter(c => c._id !== id));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Courses</h1>
        <Link to="/admin/courses/new" className="bg-blue-600 text-white px-4 py-2 rounded">Create Course</Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map(course => (
          <div key={course._id} className="border rounded p-4">
            <h2 className="font-semibold text-lg">{course.title}</h2>
            <p className="text-sm text-gray-600">{course.status}</p>
            <p className="text-sm text-gray-600">Level: {course.level}</p>
            <div className="mt-4 flex gap-2">
              <Link to={`/admin/courses/${course._id}`} className="text-blue-600 text-sm">Edit</Link>
              <button onClick={() => handleDelete(course._id)} className="text-red-600 text-sm">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}