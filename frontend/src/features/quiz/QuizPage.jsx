import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "../../styles/QuizPage.css";

function QuizPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { questions = [], difficulty, chapterId, chapterTitle } = location.state || {};

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { index: "A" }
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);

  // Guard: if navigated here without state
  if (!questions.length) {
    navigate(-1);
    return null;
  }

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const isAnswered = selectedAnswers[currentIndex] !== undefined;
  const isLast = currentIndex === totalQuestions - 1;
  const answeredCount = Object.keys(selectedAnswers).length;

  const handleSelect = (option) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: option }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const answers = questions.map((q, i) => ({
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        selected_answer: selectedAnswers[i] || null,
        explanation: q.explanation,
      }));

      const res = await api.post(`/quiz/${chapterId}/submit`, {
        difficulty,
        answers,
      });

      setResults(res.data);
      setSubmitted(true);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to submit quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExit = () => {
    navigate(-1);
  };

  // ── RESULTS SCREEN ──
  if (submitted && results) {
    const percentage = Math.round((results.score / results.total_questions) * 100);
    const grade =
      percentage >= 80 ? "Excellent! 🎉" :
      percentage >= 60 ? "Good job! 👍" :
      percentage >= 40 ? "Keep going! 💪" : "Need more practice 📚";

    return (
      <div className="quiz-page">
        <div className="quiz-navbar">
          <span className="quiz-chapter-title">{chapterTitle}</span>
        </div>

        <div className="results-container">
          <div className="score-card">
            <h2>Quiz Complete!</h2>
            <div className="score-circle">
              <span className="score-number">{results.score}</span>
              <span className="score-total">/ {results.total_questions}</span>
            </div>
            <p className="score-percent">{percentage}%</p>
            <p className="grade-label">{grade}</p>
            <div className="results-meta">
              <span className="note-badge">{difficulty}</span>
            </div>
          </div>

          <div className="results-breakdown">
            <h3>Question Breakdown</h3>
            {results.results.map((r, i) => (
              <div key={i} className={`result-item ${r.is_correct ? "correct" : "incorrect"}`}>
                <div className="result-header">
                  <span className="result-icon">{r.is_correct ? "✓" : "✗"}</span>
                  <p className="result-question">{i + 1}. {r.question}</p>
                </div>
                <div className="result-answers">
                  <p>
                    <span className="answer-label">Your answer:</span>
                    <span className={r.is_correct ? "correct-text" : "wrong-text"}>
                      {r.selected_answer ? `${r.selected_answer}. ${r.options[r.selected_answer]}` : "Not answered"}
                    </span>
                  </p>
                  {!r.is_correct && (
                    <p>
                      <span className="answer-label">Correct answer:</span>
                      <span className="correct-text">
                        {r.correct_answer}. {r.options[r.correct_answer]}
                      </span>
                    </p>
                  )}
                  <p className="explanation">💡 {r.explanation}</p>
                </div>
              </div>
            ))}
          </div>

          <button className="primary-btn back-to-chapter-btn" onClick={handleExit}>
            ← Back to Chapter
          </button>
        </div>
      </div>
    );
  }

  // ── QUIZ SCREEN ──
  return (
    <div className="quiz-page">
      {/* Locked Navbar */}
      <div className="quiz-navbar">
        <span className="quiz-chapter-title">{chapterTitle}</span>
        <div className="quiz-nav-right">
          <span className="quiz-progress-text">
            {answeredCount} / {totalQuestions} answered
          </span>
          <button className="exit-btn" onClick={() => setShowExitWarning(true)}>
            Exit Quiz
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="quiz-progress-bar">
        <div
          className="quiz-progress-fill"
          style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="quiz-container">
        <div className="question-card">
          <div className="question-header">
            <span className="question-counter">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            <span className={`difficulty-badge ${difficulty}`}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </span>
          </div>

          <h3 className="question-text">{currentQuestion.question}</h3>

          <div className="options-list">
            {Object.entries(currentQuestion.options).map(([key, value]) => (
              <button
                key={key}
                className={`option-btn ${selectedAnswers[currentIndex] === key ? "selected" : ""}`}
                onClick={() => handleSelect(key)}
              >
                <span className="option-key">{key}</span>
                <span className="option-value">{value}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="quiz-navigation">
          <button
            className="nav-btn"
            onClick={() => setCurrentIndex((i) => i - 1)}
            disabled={currentIndex === 0}
          >
            ← Previous
          </button>

          <div className="question-dots">
            {questions.map((_, i) => (
              <button
                key={i}
                className={`dot ${i === currentIndex ? "active" : ""} ${selectedAnswers[i] !== undefined ? "answered" : ""}`}
                onClick={() => setCurrentIndex(i)}
              />
            ))}
          </div>

          {isLast ? (
            <button
              className="primary-btn submit-btn"
              onClick={handleSubmit}
              disabled={submitting || answeredCount === 0}
            >
              {submitting ? "Submitting..." : "Submit Quiz"}
            </button>
          ) : (
            <button
              className="nav-btn next"
              onClick={() => setCurrentIndex((i) => i + 1)}
            >
              Next →
            </button>
          )}
        </div>
      </div>

      {/* Exit Warning Modal */}
      {showExitWarning && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Exit Quiz?</h3>
            <p>Your progress will be lost and this attempt won't be saved.</p>
            <div className="modal-actions">
              <button className="secondary-btn" onClick={() => setShowExitWarning(false)}>
                Keep Going
              </button>
              <button className="danger-btn" onClick={handleExit}>
                Exit Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuizPage;