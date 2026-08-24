import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../utils/api';
import { Document, Page, pdfjs } from 'react-pdf';
import { ArrowLeft, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import workerSrc from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SERVER_URL = API_BASE_URL.replace(/\/api$/, '');

export default function StudyNoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studyNote, setStudyNote] = useState(null);

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [showQuestions, setShowQuestions] = useState(false);
  const [hasReadPdf, setHasReadPdf] = useState(false);

  // Result modal state
  const [showResultModal, setShowResultModal] = useState(false);

  // PDF Viewer state
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [pdfError, setPdfError] = useState(null);

  const mergeQuestionDetails = (attemptAnswers, noteQuestions) => {
    return attemptAnswers.map((ans) => {
      const question = (noteQuestions || []).find(
        (q) => String(q._id) === String(ans.questionId)
      );
      return {
        _id: ans.questionId,
        question: ans.questionText || question?.question || 'Question',
        options: question?.options || [],
        correctAnswer: ans.correctAnswer,
        explanation: question?.explanation || '',
        studentAnswer: ans.selectedOption,
        isCorrect: ans.isCorrect
      };
    });
  };

  const fetchStudyNoteDetail = async () => {
    setLoading(true);
    setError(null);
    setPdfError(null);
    try {
      const res = await apiRequest(`/academics/notes/${id}`);
      if (!res.success) throw new Error(res.message || 'Failed to load study note');

      const note = res.note;
      setStudyNote(note);
      setQuizQuestions(note.questions || []);

      if (res.userAttempt && res.userAttempt.answers?.length > 0) {
        const attempt = res.userAttempt;
        const reviewQuestions = mergeQuestionDetails(attempt.answers, note.questions);

        setQuizQuestions(reviewQuestions);

        const submittedAnswers = {};
        const submittedFeedback = {};
        reviewQuestions.forEach((q) => {
          submittedAnswers[q._id] = q.studentAnswer;
          submittedFeedback[q._id] = {
            isCorrect: q.isCorrect,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation
          };
        });
        setAnswers(submittedAnswers);
        setFeedback(submittedFeedback);

        setResult({
          score: attempt.score,
          total: attempt.totalQuestions,
          percentage: attempt.percentage,
          answers: reviewQuestions.map((q) => ({
            questionId: q._id,
            selectedAnswer: q.studentAnswer,
            isCorrect: q.isCorrect,
            correctAnswer: q.correctAnswer,
            question: q.question,
            explanation: q.explanation
          }))
        });

        setShowQuestions(true);
        setHasReadPdf(true);
      } else {
        setShowQuestions(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to load study note');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return undefined;
    const timer = setTimeout(() => fetchStudyNoteDetail(), 0);
    return () => clearTimeout(timer);
  }, [id]);

  const onDocumentLoadSuccess = ({ numPages: total }) => {
    setNumPages(total);
    setPageNumber(1);
  };

  const onDocumentLoadError = () => {
    setPdfError('Failed to load PDF');
  };

  const changePage = (offset) => {
    setPageNumber((prev) => Math.min(Math.max(1, prev + offset), numPages || 1));
  };

  const handleAnswer = (questionId, selectedAnswer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: selectedAnswer }));

    const question = quizQuestions.find((q) => String(q._id) === String(questionId));
    if (question) {
      const isCorrect = question.correctAnswer === selectedAnswer;
      setFeedback((prev) => ({
        ...prev,
        [questionId]: {
          isCorrect,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation || ''
        }
      }));
    }
  };

  const handleUnlockQuestions = () => {
    setHasReadPdf(true);
    setShowQuestions(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const allAnswered = quizQuestions.every((q) => answers[q._id]);
    if (!allAnswered) {
      if (!window.confirm('You have not answered all questions. Submit anyway?')) return;
    }

    setSubmitting(true);
    try {
      const answersPayload = {};
      quizQuestions.forEach((q) => {
        answersPayload[q._id] = answers[q._id] || '';
      });

      const res = await apiRequest(`/academics/notes/${id}/quiz-submit`, 'POST', {
        answers: answersPayload,
        timeSpentSeconds: 0
      });

      const attempt = res.attempt;

      const enrichedAnswers = (attempt.answers || []).map((ans) => {
        const question = quizQuestions.find(
          (q) => String(q._id) === String(ans.questionId)
        );
        return {
          questionId: ans.questionId,
          selectedAnswer: ans.selectedOption,
          isCorrect: ans.isCorrect,
          correctAnswer: ans.correctAnswer,
          question: ans.questionText || question?.question || 'Question',
          explanation: question?.explanation || ''
        };
      });

      setResult({
        score: attempt.score,
        total: attempt.totalQuestions,
        percentage: attempt.percentage,
        answers: enrichedAnswers
      });

      const submittedFeedback = {};
      enrichedAnswers.forEach((ans) => {
        submittedFeedback[ans.questionId] = {
          isCorrect: ans.isCorrect,
          correctAnswer: ans.correctAnswer,
          explanation: ans.explanation
        };
      });
      setFeedback(submittedFeedback);

      setShowResultModal(true);
    } catch (err) {
      alert(err.message || 'Failed to submit attempt');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading study note...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-3xl mx-auto mt-6">
        <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  const pdfUrl = studyNote?.fileUrl
    ? studyNote.fileUrl.startsWith('http')
      ? studyNote.fileUrl
      : `${SERVER_URL}${studyNote.fileUrl}`
    : null;

  const hasMcqs = quizQuestions.length > 0;
  const isLastPage = pageNumber === numPages;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar - Title + Zoom Controls */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100 transition flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{studyNote?.title}</h1>
            {studyNote?.chapterTitle && (
              <p className="text-xs text-gray-500">{studyNote.chapterTitle}</p>
            )}
          </div>
        </div>
        {/* Zoom Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setScale((s) => Math.max(0.5, +(s - 0.1).toFixed(1)))}
            className="px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm font-medium"
          >
            &minus;
          </button>
          <span className="text-sm text-gray-700 font-medium min-w-[50px] text-center">{Math.round(scale * 100)}%</span>
          <button
            onClick={() => setScale((s) => Math.min(2, +(s + 0.1).toFixed(1)))}
            className="px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm font-medium"
          >
            +
          </button>
        </div>
      </div>

      {/* PDF Document Container */}
      <div
        className="w-full select-none bg-gray-100 border border-gray-200 rounded-xl overflow-y-auto"
        style={{ height: '65vh' }}
        onCopy={(e) => e.preventDefault()}
        onCut={(e) => e.preventDefault()}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="flex justify-center py-6">
          {pdfUrl ? (
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex flex-col items-center gap-4 py-16">
                  <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-blue-600"></div>
                  <p className="text-lg text-gray-600">Loading PDF...</p>
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                renderAnnotationLayer={false}
                renderTextLayer={false}
                className="!mx-auto !shadow-2xl bg-white"
                width={Math.min(window.innerWidth - 120, 1000)}
              />
            </Document>
          ) : (
            <div className="flex items-center justify-center py-24 text-gray-500">
              <div className="text-center">
                <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="text-xl">PDF not available</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PDF Error Message */}
      {pdfError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-800">⚠️ {pdfError}</p>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-4 sm:px-6 py-4 sticky bottom-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => changePage(-1)}
            disabled={pageNumber <= 1}
            className="flex-1 lg:flex-none h-11 px-5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition text-sm"
          >
            &larr; Previous
          </button>
          <span className="flex-1 text-center text-sm font-semibold text-gray-700">
            Page {pageNumber} of {numPages || '?'}
          </span>
          {!hasMcqs ? null : !hasReadPdf && isLastPage ? (
            <button
              onClick={handleUnlockQuestions}
              className="flex-1 lg:flex-none h-11 px-5 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition text-sm inline-flex items-center justify-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              Show MCQs
            </button>
          ) : (
            <button
              onClick={() => changePage(1)}
              disabled={pageNumber >= numPages || numPages === 0}
              className="flex-1 lg:flex-none h-11 px-5 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition text-sm"
            >
              Next &rarr;
            </button>
          )}
        </div>

        {hasMcqs && hasReadPdf && (
          <p className="mt-3 text-center text-sm text-green-700 flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" />
            MCQs unlocked! Scroll down to attempt.
          </p>
        )}
      </div>

      {/* Quiz Section - Show after "Show MCQs" */}
      {showQuestions && quizQuestions.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-6 lg:p-8 space-y-6">
          {result && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                  MCQ Questions
                </h2>
                <span className={`text-xl font-bold ${
                  result.percentage >= 80 ? 'text-green-600' :
                  result.percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  Score: {result.score}/{result.total} ({result.percentage}%)
                </span>
              </div>

              <div className="space-y-4 pt-4">
                <button
                  onClick={() => setShowResultModal(true)}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 border-2 border-green-600"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  VIEW DETAILED RESULT
                </button>

                <button
                  onClick={() => navigate('/student/notes')}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
                >
                  <ChevronRight className="w-5 h-5" />
                  Go To Next Study Note
                </button>
              </div>
            </>
          )}

          {!result && (
            <form onSubmit={handleSubmit} className="space-y-8">
              {quizQuestions.map((q, index) => {
                const questionFeedback = feedback[q._id];
                const selectedAnswer = answers[q._id];

                return (
                  <div key={q._id} className="space-y-4">
                    <p className="font-semibold text-lg text-gray-900 leading-tight">
                      {index + 1}. {q.question}
                    </p>
                    <div className="space-y-2 ml-2">
                      {(q.options || []).map((opt) => {
                        const isSelected = selectedAnswer === opt.label;
                        const showFeedback = questionFeedback && isSelected;
                        const isCorrect = questionFeedback?.isCorrect;

                        return (
                          <label
                            key={opt.label}
                            className={`flex items-start gap-3 cursor-pointer p-4 rounded-lg border-2 transition-all ${
                              showFeedback
                                ? isCorrect
                                  ? 'bg-green-50 border-green-400'
                                  : 'bg-red-50 border-red-400'
                                : isSelected
                                  ? 'bg-blue-50 border-blue-400'
                                  : 'hover:bg-gray-50 border-transparent'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question_${q._id}`}
                              value={opt.label}
                              checked={isSelected}
                              onChange={() => handleAnswer(q._id, opt.label)}
                              className="w-5 h-5 mt-0.5 text-blue-600"
                            />
                            <div className="flex-1">
                              <span className={`font-semibold mr-2 ${
                                showFeedback
                                  ? isCorrect ? 'text-green-800' : 'text-red-800'
                                  : isSelected ? 'text-blue-800' : 'text-gray-700'
                              }`}>
                                {opt.label})
                              </span>
                              <span className="text-gray-800">{opt.text}</span>
                            </div>
                            {showFeedback && (
                              <span className="ml-auto">
                                {isCorrect ? (
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-red-600" />
                                )}
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>

                    {questionFeedback && !questionFeedback.isCorrect && (
                      <div className="ml-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                        <p className="text-amber-800 font-medium">
                          ❌ Incorrect! Correct Answer: <span className="font-semibold">{questionFeedback.correctAnswer}</span>
                        </p>
                        {questionFeedback.explanation && (
                          <p className="text-amber-700 mt-1">
                            💡 <span className="font-medium">Explanation:</span> {questionFeedback.explanation}
                          </p>
                        )}
                      </div>
                    )}

                    {questionFeedback && questionFeedback.isCorrect && (
                      <div className="ml-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-800 font-medium text-sm">✓ Correct! Well done!</p>
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Submit Answers
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Result Modal */}
      {showResultModal && result && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60"
          onClick={() => setShowResultModal(false)}
        >
          <div
            className="relative w-full max-w-3xl bg-white shadow-2xl flex flex-col rounded-2xl overflow-hidden"
            style={{ maxHeight: '92vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fixed Header */}
            <div className="bg-green-600 px-6 pt-8 pb-6 text-center flex-shrink-0">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                🎉 Congratulations!
              </h2>
              <p className="mt-2 text-base sm:text-lg text-green-100">You've completed the study note quiz!</p>
            </div>

            <button
              onClick={() => setShowResultModal(false)}
              className="absolute right-4 top-4 h-10 w-10 rounded-full bg-white/20 text-white hover:bg-white/30 text-2xl flex items-center justify-center"
            >
              ✕
            </button>

            {/* Scrollable Body */}
            <div className="overflow-y-auto flex-1 px-4 sm:px-6 py-6 space-y-6">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-center">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Correct</p>
                  <p className="mt-2 text-4xl sm:text-5xl font-black text-gray-900">{result.score}</p>
                  <p className="text-sm text-gray-500">of {result.total}</p>
                </div>
                <div className="rounded-xl border border-green-100 bg-green-50 p-4 text-center">
                  <p className="text-xs font-semibold uppercase tracking-widest text-green-600">Score</p>
                  <p className="mt-2 text-4xl sm:text-5xl font-black text-green-600">{result.percentage}%</p>
                </div>
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-center">
                  <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">Status</p>
                  <p className="mt-2 text-2xl sm:text-3xl font-black text-blue-600 pt-2">Passed 🎯</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">Answer Review</h3>
                <div className="space-y-4">
                  {result.answers?.map((ans, index) => (
                    <div
                      key={ans.questionId}
                      className={`rounded-xl border p-4 sm:p-5 ${
                        ans.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex gap-3">
                        <span className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold flex-shrink-0 mt-0.5 ${
                          ans.isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                          {ans.isCorrect ? '✓' : '✗'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-base sm:text-lg text-gray-900 mb-2 leading-snug">
                            {index + 1}. {ans.question}
                          </p>
                          <div className="space-y-1">
                            <div className={ans.isCorrect ? 'text-green-700' : 'text-red-700'}>
                              <span className="font-semibold">Your Answer:</span> {ans.selectedAnswer || '—'}
                            </div>
                            {!ans.isCorrect && (
                              <div className="text-green-700">
                                <span className="font-semibold">Correct Answer:</span> {ans.correctAnswer}
                              </div>
                            )}
                          </div>
                          {ans.explanation && (
                            <div className="mt-3 text-sm sm:text-base text-gray-600 italic">
                              💡 <span className="font-medium">Explanation:</span> {ans.explanation}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Fixed Footer Buttons */}
            <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-t border-gray-100 space-y-3">
              <button
                onClick={() => setShowResultModal(false)}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
              >
                Awesome, Keep Learning! 🚀
              </button>

              <button
                onClick={() => navigate('/student/notes')}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
              >
                <ChevronRight className="w-5 h-5" />
                Go To Next Study Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
