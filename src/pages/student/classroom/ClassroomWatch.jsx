import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { apiRequest } from '../../../utils/api';
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  FileQuestion,
  Trophy,
  XCircle,
  RotateCcw
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SERVER_URL = API_BASE.replace(/\/api$/, '');

// PAGE 3: Watch Player (opened only by clicking a lecture from the list)
export default function ClassroomWatch() {
  const navigate = useNavigate();
  const { courseId, videoId } = useParams();
  const location = useLocation();
  const courseName = location.state?.courseName || 'Course Playlist';

  const [playlist, setPlaylist] = useState([]);
  const [video, setVideo] = useState(null);
  const [notFound, setNotFound] = useState(false);

  // Video Practice MCQ state
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [userAttempt, setUserAttempt] = useState(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [result, setResult] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [quizStartedAt, setQuizStartedAt] = useState(null);

  useEffect(() => {
    if (!courseId || !videoId) return undefined;

    const timer = setTimeout(() => {
      // Playlist (for sequence guard + next lecture button)
      apiRequest(`/lms/courses/${courseId}/videos`)
        .then(async (res) => {
          if (!res.success) return;
          const list = res.videos || [];
          setPlaylist(list);

          // Sequence lock guard: block direct URL access to a locked lecture
          const idx = list.findIndex((v) => v._id === videoId);
          if (idx === -1) {
            setNotFound(true);
            return;
          }
          if (idx > 0 && !list[idx - 1]?.progress?.isWatched) {
            alert('This lecture is locked. Complete the previous lecture first.');
            navigate(`/student/classroom/course/${courseId}`, { state: { courseName }, replace: true });
            return;
          }

          // Video detail + attached MCQs + previous attempt
          try {
            const detail = await apiRequest(`/lms/videos/${videoId}/detail`);
            if (!detail.success) {
              setNotFound(true);
              return;
            }
            setVideo(detail.video);
            setQuizQuestions(detail.video.questions || []);

            if (detail.userAttempt && detail.userAttempt.answers?.length > 0) {
              const att = detail.userAttempt;
              setUserAttempt(att);
              const reviewAnswers = {};
              const reviewFeedback = {};
              att.answers.forEach((a) => {
                reviewAnswers[a.questionId] = a.selectedOption;
                reviewFeedback[a.questionId] = {
                  isCorrect: a.isCorrect,
                  correctAnswer: a.correctAnswer,
                  explanation: (detail.video.questions || []).find(
                    (q) => String(q._id) === String(a.questionId)
                  )?.explanation || ''
                };
              });
              setAnswers(reviewAnswers);
              setFeedback(reviewFeedback);
              setResult({
                score: att.score,
                totalQuestions: att.totalQuestions,
                percentage: att.percentage,
                status: att.status
              });
            }
          } catch (err) {
            console.error('Video detail error:', err);
            setNotFound(true);
          }
        })
        .catch((err) => console.error(err));
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, videoId]);

  const currentIndex = playlist.findIndex((v) => v._id === videoId);
  const nextLecture = currentIndex >= 0 && currentIndex < playlist.length - 1 ? playlist[currentIndex + 1] : null;
  const nextUnlocked =
    Boolean(video?.progress?.isWatched) || videoEnded; // finishing current unlocks next

  const handleVideoEnded = async () => {
    if (!video) return;
    setVideoEnded(true);
    try {
      await apiRequest(`/lms/videos/${video._id}/progress`, 'POST', {
        watchedSeconds: video.durationInSeconds || 600,
        durationInSeconds: video.durationInSeconds || 600
      });
      // Refresh playlist so the next lecture shows as unlocked when going back
      const res = await apiRequest(`/lms/courses/${courseId}/videos`);
      if (res.success) {
        setPlaylist(res.videos || []);
        setVideo((prev) => ({
          ...prev,
          progress: { ...prev.progress, isWatched: true }
        }));
      }
    } catch (e) {
      console.error('Progress sync error:', e);
    }
  };

  const isQuizUnlocked = Boolean(
    videoEnded || video?.progress?.isWatched || userAttempt || quizQuestions.length === 0
  );

  const handleAnswer = (questionId, selectedOption) => {
    if (feedback[questionId]) return; // Locked once answered
    setAnswers((prev) => ({ ...prev, [questionId]: selectedOption }));
    if (!quizStartedAt) setQuizStartedAt(new Date().getTime());

    const question = quizQuestions.find((q) => String(q._id) === String(questionId));
    if (question) {
      setFeedback((prev) => ({
        ...prev,
        [questionId]: {
          isCorrect: question.correctAnswer === selectedOption,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation || ''
        }
      }));
    }
  };

  const allAnswered = quizQuestions.length > 0 && quizQuestions.every((q) => answers[q._id]);

  const handleSubmitQuiz = async () => {
    if (!allAnswered || submittingQuiz) return;
    setSubmittingQuiz(true);
    try {
      const res = await apiRequest(`/lms/videos/${video._id}/quiz-submit`, 'POST', {
        answers,
        timeSpentSeconds: quizStartedAt ? Math.round((new Date().getTime() - quizStartedAt) / 1000) : 0
      });
      if (res.success) {
        setUserAttempt(res.attempt);
        setResult({
          score: res.attempt.score,
          totalQuestions: res.attempt.totalQuestions,
          percentage: res.attempt.percentage,
          status: res.attempt.status
        });
        setShowResultModal(true);
      } else {
        throw new Error(res.message || 'Quiz submission failed');
      }
    } catch (err) {
      alert(err.message || 'Error submitting quiz');
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const retakeQuiz = () => {
    const freshAnswers = {};
    quizQuestions.forEach((q) => {
      freshAnswers[q._id] = '';
    });
    setAnswers(freshAnswers);
    setFeedback({});
    setUserAttempt(null);
    setResult(null);
    setShowResultModal(false);
    setQuizStartedAt(new Date().getTime());
  };

  const backToList = () =>
    navigate(`/student/classroom/course/${courseId}`, { state: { courseName } });

  if (notFound) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
        <p className="text-sm font-bold text-slate-500">Lecture not found.</p>
        <button onClick={backToList} className="text-xs font-bold text-[#0b3c68] underline">
          ← Back to lecture list
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={backToList}
          className="mb-1 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0b3c68]"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Lectures ({courseName})
        </button>
        <h1 className="font-display text-xl font-black text-slate-900 tracking-tight sm:text-2xl">
          {video ? `Lecture ${currentIndex + 1}: ${video.title}` : 'Loading lecture...'}
        </h1>
      </div>

      {/* PLAYER */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-black shadow-xl">
        {video ? (
          <video
            key={video._id}
            src={video.videoUrl.startsWith('http') ? video.videoUrl : `${SERVER_URL}${video.videoUrl}`}
            controls
            autoPlay
            onEnded={handleVideoEnded}
            className="w-full aspect-video object-contain"
          />
        ) : (
          <div className="flex aspect-video items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/30 border-t-white"></div>
          </div>
        )}
      </div>

      {/* INFO CARD */}
      {video && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="rounded-md bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-[#0b3c68]">
              {video.moduleTitle}
            </span>
            {video.progress?.isWatched && (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Completed
              </span>
            )}
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {video.description || 'Hands-on training tutorial covering core architectural topics and project workflows.'}
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {!video.progress?.isWatched && (
              <button
                onClick={handleVideoEnded}
                className="rounded-xl bg-emerald-50 border border-emerald-300 px-4 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition"
              >
                ✓ Mark as Finished
              </button>
            )}
            {nextLecture && nextUnlocked && (
              <button
                onClick={() =>
                  navigate(`/student/classroom/watch/${courseId}/${nextLecture._id}`, {
                    state: { courseName }
                  })
                }
                className="rounded-xl bg-[#0b3c68] px-4 py-2 text-xs font-bold text-white shadow hover:bg-[#12518a] transition"
              >
                Next Lecture: {nextLecture.title.slice(0, 28)}{nextLecture.title.length > 28 ? '...' : ''} →
              </button>
            )}
          </div>
        </div>
      )}

      {/* VIDEO PRACTICE MCQ SECTION */}
      {video && quizQuestions.length > 0 && (
        <div className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="flex items-center gap-2 font-display text-sm font-black text-slate-900">
                <FileQuestion className="h-4 w-4 text-emerald-700" />
                Video Practice MCQs ({quizQuestions.length})
              </h3>
              <p className="text-[11px] text-slate-500">
                Self-assessment quiz attached to this lecture — pass with 40% or more.
              </p>
            </div>
            {!isQuizUnlocked ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-[10px] font-bold text-slate-500">
                <Lock className="h-3 w-3" /> Watch the full lecture to unlock
              </span>
            ) : userAttempt ? (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold ${
                  userAttempt.status === 'Passed'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}
              >
                <CheckCircle2 className="h-3 w-3" /> Best Score: {userAttempt.score}/{userAttempt.totalQuestions} ({userAttempt.percentage}%)
              </span>
            ) : null}
          </div>

          {isQuizUnlocked ? (
            <>
              <div className="space-y-3">
                {quizQuestions.map((q, idx) => {
                  const fb = feedback[q._id];
                  return (
                    <div key={q._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2.5">
                      <p className="text-xs font-bold text-slate-800">
                        Q{idx + 1}. {q.question}
                      </p>
                      <div className="grid gap-1.5 sm:grid-cols-2">
                        {q.options.map((opt) => {
                          const isSelected = answers[q._id] === opt.label;
                          let optClass = 'border-slate-200 bg-white hover:border-emerald-400 cursor-pointer';
                          if (fb) {
                            if (opt.label === q.correctAnswer) {
                              optClass = 'border-emerald-400 bg-emerald-50 text-emerald-800';
                            } else if (isSelected) {
                              optClass = 'border-red-400 bg-red-50 text-red-700';
                            } else {
                              optClass = 'border-slate-200 bg-white opacity-60';
                            }
                          } else if (isSelected) {
                            optClass = 'border-[#0b3c68] bg-sky-50 text-[#0b3c68]';
                          }
                          return (
                            <button
                              key={opt.label}
                              type="button"
                              disabled={Boolean(fb)}
                              onClick={() => handleAnswer(q._id, opt.label)}
                              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-[11px] font-semibold transition ${optClass}`}
                            >
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-black">
                                {opt.label}
                              </span>
                              {opt.text}
                            </button>
                          );
                        })}
                      </div>
                      {fb && (
                        <div
                          className={`rounded-xl px-3 py-2 text-[11px] font-semibold ${
                            fb.isCorrect ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {fb.isCorrect ? '✓ Correct! ' : `✗ Incorrect — correct answer is (${fb.correctAnswer}). `}
                          {fb.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-2">
                {userAttempt && (
                  <button
                    type="button"
                    onClick={retakeQuiz}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Retake Quiz
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSubmitQuiz}
                  disabled={!allAnswered || submittingQuiz}
                  className="rounded-xl bg-emerald-700 px-6 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-800 disabled:opacity-40"
                >
                  {submittingQuiz ? 'Submitting...' : userAttempt ? 'Update My Attempt' : 'Submit Practice Quiz'}
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
              <Lock className="h-5 w-5 shrink-0 text-slate-400" />
              <p className="text-[11px] font-semibold text-slate-500">
                Finish watching this lecture to unlock the {quizQuestions.length} practice MCQs.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Quiz Result Modal */}
      {showResultModal && result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg my-8 rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="text-center space-y-1">
              <Trophy className={`mx-auto h-10 w-10 ${result.status === 'Passed' ? 'text-amber-500' : 'text-slate-400'}`} />
              <h3 className="font-display text-xl font-black text-slate-900">
                {result.status === 'Passed' ? 'Congratulations! 🎉' : 'Keep Practicing!'}
              </h3>
              <p className="text-xs text-slate-500">{video?.title}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3">
                <p className="text-[10px] font-bold uppercase text-emerald-700">Correct</p>
                <p className="text-lg font-black text-emerald-800">{result.score}</p>
              </div>
              <div className="rounded-2xl bg-sky-50 border border-sky-200 p-3">
                <p className="text-[10px] font-bold uppercase text-[#0b3c68]">Score</p>
                <p className="text-lg font-black text-[#0b3c68]">{result.percentage}%</p>
              </div>
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3">
                <p className="text-[10px] font-bold uppercase text-slate-500">Status</p>
                <p
                  className={`text-sm font-black flex items-center justify-center gap-1 ${
                    result.status === 'Passed' ? 'text-emerald-700' : 'text-red-600'
                  }`}
                >
                  {result.status === 'Passed' ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  {result.status}
                </p>
              </div>
            </div>

            {/* Answer Review */}
            <div className="max-h-64 overflow-y-auto rounded-2xl border border-slate-200 divide-y divide-slate-100">
              <p className="bg-slate-50 px-4 py-2 text-[11px] font-black uppercase tracking-wide text-slate-500">
                Answer Review
              </p>
              {quizQuestions.map((q, idx) => {
                const ansId = String(q._id);
                const selected = answers[ansId];
                const correct = q.correctAnswer;
                const ok = selected === correct;
                return (
                  <div key={q._id} className="px-4 py-2.5 space-y-1">
                    <p className="text-[11px] font-bold text-slate-700">
                      Q{idx + 1}. {q.question}
                    </p>
                    <p className={`text-[10px] font-semibold ${ok ? 'text-emerald-700' : 'text-red-600'}`}>
                      Your answer: ({selected || '—'}) {ok ? '✓' : `✗ — Correct: (${correct}) ${
                        q.options.find((o) => o.label === correct)?.text || ''
                      }`}
                    </p>
                    {q.explanation && (
                      <p className="text-[10px] italic text-slate-500">{q.explanation}</p>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setShowResultModal(false)}
              className="w-full rounded-xl bg-[#0b3c68] py-2.5 text-xs font-bold text-white shadow hover:bg-[#12518a]"
            >
              Continue Learning
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
