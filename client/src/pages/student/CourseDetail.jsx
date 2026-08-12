import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { courseApi } from '../../services/courseApi';
import { progressApi } from '../../services/progressApi';
import { quizApi } from '../../services/quizApi';
import { useAuth } from '../../contexts/AuthContext';
import { Trophy, Medal, Award, RefreshCw, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState(null);
  const [progressMap, setProgressMap] = useState({});
  const [courseQuiz, setCourseQuiz] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const videoRef = useRef(null);
  const lastReportedProgress = useRef(0);

  useEffect(() => {
    lastReportedProgress.current = 0;
  }, [activeLesson]);

  useEffect(() => {
    courseApi.getFullCourse(courseId).then(res => {
      setCourse(res.data);
      const firstLesson = res.data.modules?.[0]?.lessons?.[0];
      if (firstLesson) setActiveLesson(firstLesson);
      setLoading(false);
    });
  }, [courseId]);

  useEffect(() => {
    if (!course) return;
    const fetchProgress = async () => {
      try {
        const res = await progressApi.getCourseProgress(courseId);
        const map = {};
        res.data.forEach(p => {
          map[p.lesson._id] = p;
        });
        setProgressMap(map);
      } catch (err) {
        console.error('Failed to fetch progress', err);
      }
    };
    fetchProgress();
  }, [course, courseId, refreshKey]);

  useEffect(() => {
    if (!course) return;
    const fetchQuiz = async () => {
      try {
        const res = await quizApi.getQuizzes(courseId);
        const quiz = res.data.find(q => q.title.toLowerCase().includes('test') || q.title.toLowerCase().includes('exam'));
        if (quiz) {
          setCourseQuiz(quiz);
          try {
            const attemptsRes = await quizApi.getMyAttempts(quiz._id);
            if (attemptsRes.data.length > 0) {
              setTestResult(attemptsRes.data[0]);
            } else {
              setTestResult(null);
            }
          } catch (e) {
            console.error('Failed to fetch attempts', e);
          }
          try {
            const lbRes = await quizApi.getLeaderboard(quiz._id);
            setLeaderboard(lbRes.data || []);
          } catch (e) {
            console.error('Failed to fetch leaderboard', e);
          }
        }
      } catch (err) {
        console.error('Failed to fetch quiz', err);
      }
    };
    fetchQuiz();
  }, [course, courseId, refreshKey]);

  const isYouTube = (url) =>
    url.includes('youtube.com/embed') || url.includes('youtube-nocookie.com/embed');

  const handleTimeUpdate = useCallback(async () => {
    if (!videoRef.current || !activeLesson) return;
    const video = videoRef.current;
    if (!video.duration || !isFinite(video.duration)) return;
    const progress = Math.round((video.currentTime / video.duration) * 100);
    if (progress <= lastReportedProgress.current) return;
    if (progress - lastReportedProgress.current < 5 && progress < 100) return;
    lastReportedProgress.current = progress;
    try {
      await progressApi.trackVideoProgress(activeLesson._id, {
        videoProgress: progress,
        watchedDuration: video.currentTime,
      });
    } catch (err) {
      console.error('Failed to track progress', err);
    }
  }, [activeLesson]);

  const handleVideoEnded = useCallback(async () => {
    if (!activeLesson) return;
    try {
      await progressApi.trackVideoProgress(activeLesson._id, {
        videoProgress: 100,
        watchedDuration: activeLesson.duration || 0,
      });
      const res = await progressApi.getLessonProgress(activeLesson._id);
      setProgressMap(prev => ({ ...prev, [activeLesson._id]: res.data }));
    } catch (err) {
      console.error('Failed to mark lesson complete', err);
    }
  }, [activeLesson]);

  const handleSeeking = useCallback(() => {
    if (!videoRef.current || !activeLesson) return;
    const video = videoRef.current;
    const completed = progressMap[activeLesson._id]?.completed;
    
    // Allow free seeking if lesson is already completed
    if (completed) return;
    
    const lastWatched = progressMap[activeLesson._id]?.watchedDuration || 0;
    
    // Prevent ANY forward seeking - only allow rewinding
    if (video.currentTime > lastWatched + 0.5) {
      video.currentTime = lastWatched;
    }
  }, [activeLesson, progressMap]);

  // Set video to last watched position when lesson changes
  useEffect(() => {
    if (!videoRef.current || !activeLesson) return;
    const video = videoRef.current;
    const lastWatched = progressMap[activeLesson._id]?.watchedDuration || 0;
    
    const setInitialPosition = () => {
      if (lastWatched > 0 && video.duration > 0) {
        video.currentTime = lastWatched;
      }
    };

    // Wait for video metadata to load
    if (video.readyState >= 1) {
      setInitialPosition();
    } else {
      video.addEventListener('loadedmetadata', setInitialPosition);
      return () => video.removeEventListener('loadedmetadata', setInitialPosition);
    }
  }, [activeLesson, progressMap]);

  // Prevent video download and right-click
  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    return false;
  }, []);

  const handleVideoLoad = useCallback(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    
    // Disable download attribute
    video.setAttribute('controlsList', 'nodownload');
    video.setAttribute('disablePictureInPicture', 'true');
  }, []);

  const isLessonCompleted = (lessonId) => progressMap[lessonId]?.completed || false;

  if (loading) return <div className="p-6 text-gray-500 dark:text-gray-400">Loading...</div>;

  const flattenLessons = () => {
    const lessons = [];
    course.modules?.forEach(mod => {
      mod.lessons?.forEach(lesson => {
        lessons.push({ ...lesson, moduleTitle: mod.title });
      });
    });
    return lessons;
  };

  const allLessons = flattenLessons();

  const isLessonUnlocked = (lesson, allLessons) => {
    const index = allLessons.findIndex(l => l._id === lesson._id);
    if (index <= 0) return true;
    const previousLesson = allLessons[index - 1];
    return isLessonCompleted(previousLesson._id);
  };

  const isCourseCompleted = () => {
    return allLessons.length > 0 && allLessons.every(lesson => isLessonCompleted(lesson._id));
  };

  const testLesson = courseQuiz ? {
    _id: `test-${courseQuiz._id}`,
    title: `📝 ${courseQuiz.title}`,
    moduleTitle: 'Course Test',
    contentType: 'test',
    isTest: true,
    quizId: courseQuiz._id,
  } : null;

  const handleLessonClick = async (lesson) => {
    if (lesson._id === activeLesson?._id) return;
    if (lesson.isTest) {
      if (!isCourseCompleted()) {
        alert('Complete all lessons before taking the test.');
        return;
      }
      setActiveLesson(lesson);
      navigate(`/quizzes/${lesson.quizId}`);
      return;
    }
    try {
      const res = await progressApi.checkLessonUnlock(lesson._id);
      if (!res.data.unlocked) {
        alert('Complete the previous lesson to unlock this one.');
        return;
      }
      setActiveLesson(lesson);
    } catch (err) {
      console.error('Failed to check unlock', err);
      setActiveLesson(lesson);
    }
  };

  const isTestUnlocked = () => {
    if (!testLesson) return false;
    return isCourseCompleted();
  };

  const currentLesson = activeLesson || allLessons[0];

  const getRankIcon = (rank) => {
    if (rank === 0) return <Trophy className="w-4 h-4 text-yellow-400" />;
    if (rank === 1) return <Medal className="w-4 h-4 text-gray-400" />;
    if (rank === 2) return <Award className="w-4 h-4 text-orange-400" />;
    return null;
  };

  const getRankStyle = (rank) => {
    if (rank === 0) return 'text-yellow-400';
    if (rank === 1) return 'text-gray-400';
    if (rank === 2) return 'text-orange-400';
    return 'text-gray-500 dark:text-gray-400';
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50 dark:bg-slate-900">
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50 dark:bg-slate-900 lg:mr-72">
        <div className="flex items-center gap-2 mb-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 transition-colors touch-manipulation"
            aria-label="Open lesson panel"
          >
            <PanelLeftOpen size={20} />
          </button>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{course.title}</span>
        </div>
        {currentLesson ? (
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{currentLesson.title}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">{currentLesson.moduleTitle} • {currentLesson.contentType}</p>
              </div>
            </div>

            {currentLesson.videoUrl && (
              <div className="mb-6">
                {isYouTube(currentLesson.videoUrl) ? (
                  <iframe
                    key={currentLesson._id}
                    src={currentLesson.videoUrl}
                    className="w-full aspect-video rounded-lg shadow-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    key={currentLesson._id}
                    ref={videoRef}
                    src={currentLesson.videoUrl}
                    className="w-full aspect-video rounded-lg shadow-lg"
                    controls
                    controlsList="nodownload"
                    disablePictureInPicture
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleVideoEnded}
                    onSeeking={handleSeeking}
                    onContextMenu={handleContextMenu}
                    onLoadedMetadata={handleVideoLoad}
                    style={{ userSelect: 'none' }}
                  />
                )}
              </div>
            )}

            {currentLesson.isTest ? (
              <div className="mb-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 text-center transition-all duration-300">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{currentLesson.title}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{currentLesson.moduleTitle}</p>
                  {!testResult ? (
                    <button
                      onClick={() => handleLessonClick(testLesson)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105"
                    >
                      📝 Start Test
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-4 mb-4 flex-wrap">
                        <p className={`text-4xl font-bold transition-all duration-300 ${(testResult.finalGrade || testResult.score) >= (courseQuiz?.passingScore || 50) ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {testResult.finalGrade || testResult.score}% ({Math.round(((testResult.finalGrade || testResult.score) / 100) * (testResult.totalPoints || 30))}/{testResult.totalPoints || 30} marks)
                        </p>
                        <span className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                          (testResult.finalGrade || testResult.score) >= (courseQuiz?.passingScore || 50)
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        }`}>
                          {(testResult.finalGrade || testResult.score) >= (courseQuiz?.passingScore || 50) ? 'Passed' : 'Not Passed'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Score: {testResult.score || testResult.finalGrade}% •{' '}
                        {testResult.passed ? '✅ Passed' : '❌ Failed'}
                      </p>
                      <div className="mt-4 flex gap-2 justify-center">
                        <Link
                          to={`/quizzes/${courseQuiz._id}/leaderboard`}
                          className="inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105"
                        >
                          View Leaderboard
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                {currentLesson.content && (
                  <div className="prose max-w-none mb-6 dark:prose-invert" dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
                )}
              </>
            )}

            {!currentLesson.isTest && currentLesson.codeBlocks?.length > 0 && (
              <div className="mb-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Code Examples</h3>
                {currentLesson.codeBlocks.map((block, idx) => (
                  <div key={idx} className="border border-gray-200 dark:border-slate-600 rounded-lg">
                    <div className="bg-gray-100 dark:bg-slate-700 px-4 py-1 text-xs font-medium text-gray-700 dark:text-gray-300">{block.language}</div>
                    <pre className="p-4 overflow-x-auto bg-gray-900 text-gray-100 text-sm rounded-b-lg">{block.code}</pre>
                  </div>
                ))}
              </div>
            )}

            {!currentLesson.isTest && currentLesson.images?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Images</h3>
                <div className="grid grid-cols-2 gap-4">
                  {currentLesson.images.map((img, idx) => (
                    <img key={idx} src={img.url} alt={img.originalName} className="rounded-lg shadow" />
                  ))}
                </div>
              </div>
            )}

            {!currentLesson.isTest && currentLesson.attachments?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Downloads</h3>
                <div className="space-y-2">
                  {currentLesson.attachments.map((att, idx) => (
                    <a key={idx} href={att.url} download={att.originalName} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline">
                      <span>📎</span>
                      <span>{att.originalName}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {!currentLesson.isTest && currentLesson.externalLinks?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">External Links</h3>
                <div className="space-y-2">
                  {currentLesson.externalLinks.map((link, idx) => (
                    <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline">
                      <span>🔗</span>
                      <span>{link.title || link.url}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-500 dark:text-gray-400">Select a lesson to start learning.</div>
        )}
      </main>

      <aside className="hidden lg:flex fixed top-0 right-0 bg-white dark:bg-slate-800 border-l overflow-y-auto transition-all duration-300 ease-in-out w-72 flex-col h-screen z-10">
        <div className="p-4 border-b border-gray-200 dark:border-slate-600">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{course.title}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{course.description}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">📚 {allLessons.length} lessons</p>
        </div>

        <div className="px-4 pb-4 space-y-4 overflow-y-auto flex-1">
          {course.modules?.map(mod => (
            <div key={mod._id}>
              <details open className="mb-2">
                <summary className="font-semibold text-sm text-gray-700 dark:text-gray-300 cursor-pointer">{mod.title}</summary>
                <div className="mt-2 space-y-1">
                  {mod.lessons?.map(lesson => {
                    const completed = isLessonCompleted(lesson._id);
                    const unlocked = isLessonUnlocked(lesson, allLessons);
                    const isActive = currentLesson?._id === lesson._id;
                    return (
                      <button
                        key={lesson._id}
                        onClick={() => unlocked && handleLessonClick(lesson)}
                        disabled={!unlocked}
                        className={`w-full text-left text-sm p-2 rounded transition-all ${
                          isActive
                            ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                            : !unlocked
                            ? 'opacity-40 cursor-not-allowed text-gray-400 hover:bg-transparent'
                            : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <span className="mr-1">{completed ? '✅' : !unlocked ? '🔒' : '▶'}</span>
                        {lesson.title}
                        {lesson.isFree && <span className="ml-1 text-xs text-green-600 dark:text-green-400">(Free)</span>}
                      </button>
                    );
                  })}
                </div>
              </details>
            </div>
          ))}
              {testLesson && (
                <div key={testLesson._id}>
                  <details open>
                    <summary className="font-semibold text-sm cursor-pointer text-gray-700 dark:text-gray-300">Course Test</summary>
                    <div className="mt-2 space-y-1">
                      <button
                        onClick={() => isTestUnlocked() && !testResult && handleLessonClick(testLesson)}
                        disabled={!isTestUnlocked() || testResult}
                        className={`w-full text-left text-sm p-2 rounded transition-all ${
                          testResult
                            ? 'opacity-60 cursor-default text-gray-500 dark:text-gray-400'
                            : currentLesson?._id === testLesson._id
                            ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                            : !isTestUnlocked()
                            ? 'opacity-40 cursor-not-allowed text-gray-400 hover:bg-transparent'
                            : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <span className="mr-1">{testResult ? '✅' : isLessonCompleted(testLesson._id) ? '✅' : !isTestUnlocked() ? '🔒' : '🎯'}</span>
                        {testLesson.title}
                      </button>
                      {testResult && (
                        <div className="mt-2 p-3 bg-gray-50 dark:bg-slate-700/50 rounded text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your Score</p>
                          <p className={`text-sm font-bold ${(testResult.finalGrade || testResult.score) >= (courseQuiz?.passingScore || 50) ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {testResult.finalGrade || testResult.score}% ({Math.round(((testResult.finalGrade || testResult.score) / 100) * (testResult.totalPoints || 30))}/{testResult.totalPoints || 30} marks)
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {testResult.passed ? '✅ Passed' : '❌ Failed'}
                          </p>
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              )}
        </div>

        {courseQuiz && (
          <div className="px-4 pb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-400" />
                Leaderboard
              </h3>
              <button
                onClick={() => setRefreshKey(k => k + 1)}
                className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-all duration-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                title="Refresh"
              >
                <RefreshCw size={14} />
              </button>
            </div>
            {!courseQuiz.passingScore && leaderboard.length === 0 ? (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                <p className="text-sm">No results yet.</p>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="space-y-2">
                {testResult && (
                  <div className="text-center py-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your Score</p>
                    <p className={`font-bold text-lg ${(testResult.finalGrade || testResult.score) >= (courseQuiz?.passingScore || 50) ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {testResult.finalGrade || testResult.score}%
                    </p>
                  </div>
                )}
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center">Take the test to appear here!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.slice(0, 3).map((entry, idx) => {
                  const isCurrentUser = entry.student?._id === user?._id;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                        isCurrentUser
                          ? 'bg-gradient-to-r from-yellow-100 to-yellow-50 dark:from-yellow-900/30 dark:to-yellow-900/10 ring-1 ring-yellow-400 shadow-md'
                          : idx === 0
                          ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/10'
                          : idx === 1
                          ? 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50'
                          : 'bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10'
                      }`}
                    >
                      <div className="flex items-center justify-center w-6">
                        {getRankIcon(idx)}
                        {!getRankIcon(idx) && <span className={`font-bold text-sm ${getRankStyle(idx)}`}>#{idx + 1}</span>}
                      </div>
                      <div className="w-7 h-7 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                          {entry.student?.firstName?.charAt(0)}{entry.student?.lastName?.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {entry.student?.firstName} {entry.student?.lastName}
                          {entry.student?._id === user?._id && ' (You)'}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{entry.score}%</span>
                    </div>
                  );
                })}
                {!leaderboard.find(e => e.student?._id === user?._id) && testResult && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">
                    Your position would be: #{leaderboard.filter((e) => (e.score || 0) > (testResult.finalGrade || testResult.score || 0)).length + 1}
                  </p>
                )}
                {leaderboard.length > 3 && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 text-center pt-2">+{leaderboard.length - 3} more</p>
                )}
              </div>
            )}
            <Link
              to={`/quizzes/${courseQuiz._id}/leaderboard`}
              onClick={() => setRefreshKey(k => k + 1)}
              className="flex items-center justify-center gap-1 mt-4 text-blue-600 dark:text-blue-400 hover:underline text-xs text-center transition-colors"
            >
              View Full Leaderboard
            </Link>
          </div>
        )}
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-80 bg-white dark:bg-slate-800 border-l overflow-y-auto transition-transform duration-300 ease-in-out flex flex-col h-full shadow-2xl">
            <div className="p-4 border-b border-gray-200 dark:border-slate-600">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">{course.title}</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{course.description}</p>
            </div>
            <div className="px-4 pb-4 space-y-4 overflow-y-auto flex-1">
              {course.modules?.map(mod => (
                <div key={mod._id}>
                  <details open className="mb-2">
                    <summary className="font-semibold text-sm text-gray-700 dark:text-gray-300 cursor-pointer">{mod.title}</summary>
                    <div className="mt-2 space-y-1">
                      {mod.lessons?.map(lesson => {
                        const completed = isLessonCompleted(lesson._id);
                        const unlocked = isLessonUnlocked(lesson, allLessons);
                        const isActive = currentLesson?._id === lesson._id;
                        return (
                          <button
                            key={lesson._id}
                            onClick={() => { unlocked && handleLessonClick(lesson); setSidebarOpen(false); }}
                            disabled={!unlocked}
                            className={`w-full text-left text-sm p-2 rounded transition-all ${
                              isActive
                                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                : !unlocked
                                ? 'opacity-40 cursor-not-allowed text-gray-400 hover:bg-transparent'
                                : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <span className="mr-1">{completed ? '✅' : !unlocked ? '🔒' : '▶'}</span>
                            {lesson.title}
                            {lesson.isFree && <span className="ml-1 text-xs text-green-600 dark:text-green-400">(Free)</span>}
                          </button>
                        );
                      })}
                    </div>
                  </details>
                </div>
              ))}
              {testLesson && (
                <div key={testLesson._id}>
                  <details open>
                    <summary className="font-semibold text-sm cursor-pointer text-gray-700 dark:text-gray-300">Course Test</summary>
                    <div className="mt-2 space-y-1">
                      <button
                        onClick={() => { isTestUnlocked() && !testResult && handleLessonClick(testLesson); setSidebarOpen(false); }}
                        disabled={!isTestUnlocked() || testResult}
                        className={`w-full text-left text-sm p-2 rounded transition-all ${
                          testResult
                            ? 'opacity-60 cursor-default text-gray-500 dark:text-gray-400'
                            : currentLesson?._id === testLesson._id
                            ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                            : !isTestUnlocked()
                            ? 'opacity-40 cursor-not-allowed text-gray-400 hover:bg-transparent'
                            : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <span className="mr-1">{testResult ? '✅' : isLessonCompleted(testLesson._id) ? '✅' : !isTestUnlocked() ? '🔒' : '🎯'}</span>
                        {testLesson.title}
                      </button>
                      {testResult && (
                        <div className="mt-2 p-3 bg-gray-50 dark:bg-slate-700/50 rounded text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your Score</p>
                          <p className={`text-sm font-bold ${(testResult.finalGrade || testResult.score) >= (courseQuiz?.passingScore || 50) ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {testResult.finalGrade || testResult.score}% ({Math.round(((testResult.finalGrade || testResult.score) / 100) * (testResult.totalPoints || 30))}/{testResult.totalPoints || 30} marks)
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {testResult.passed ? '✅ Passed' : '❌ Failed'}
                          </p>
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              )}
            </div>

            {courseQuiz && (
              <div className="px-4 pb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    Leaderboard
                  </h3>
                  <button
                    onClick={() => setRefreshKey(k => k + 1)}
                    className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-all duration-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                    title="Refresh"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>
                {!courseQuiz.passingScore && leaderboard.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    <Trophy className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm">No results yet.</p>
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="space-y-2">
                    {testResult && (
                      <div className="text-center py-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your Score</p>
                        <p className={`font-bold text-lg ${(testResult.finalGrade || testResult.score) >= (courseQuiz?.passingScore || 50) ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {testResult.finalGrade || testResult.score}%
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 dark:text-gray-500 text-center">Take the test to appear here!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {leaderboard.slice(0, 3).map((entry, idx) => {
                      const isCurrentUser = entry.student?._id === user?._id;
                      return (
                        <div
                          key={idx}
                          className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                            isCurrentUser
                              ? 'bg-gradient-to-r from-yellow-100 to-yellow-50 dark:from-yellow-900/30 dark:to-yellow-900/10 ring-1 ring-yellow-400 shadow-md'
                              : idx === 0
                              ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/10'
                              : idx === 1
                              ? 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50'
                              : 'bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10'
                          }`}
                        >
                          <div className="flex items-center justify-center w-6">
                            {getRankIcon(idx)}
                            {!getRankIcon(idx) && <span className={`font-bold text-sm ${getRankStyle(idx)}`}>#{idx + 1}</span>}
                          </div>
                          <div className="w-7 h-7 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                              {entry.student?.firstName?.charAt(0)}{entry.student?.lastName?.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {entry.student?.firstName} {entry.student?.lastName}
                              {entry.student?._id === user?._id && ' (You)'}
                            </p>
                          </div>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{entry.score}%</span>
                        </div>
                      );
                    })}
                    {!leaderboard.find(e => e.student?._id === user?._id) && testResult && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">
                        Your position would be: #{leaderboard.filter((e) => (e.score || 0) > (testResult.finalGrade || testResult.score || 0)).length + 1}
                      </p>
                    )}
                    {leaderboard.length > 3 && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 text-center pt-2">+{leaderboard.length - 3} more</p>
                    )}
                  </div>
                )}
                <Link
                  to={`/quizzes/${courseQuiz._id}/leaderboard`}
                  onClick={() => setRefreshKey(k => k + 1)}
                  className="flex items-center justify-center gap-1 mt-4 text-blue-600 dark:text-blue-400 hover:underline text-xs text-center transition-colors"
                >
                  View Full Leaderboard
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
