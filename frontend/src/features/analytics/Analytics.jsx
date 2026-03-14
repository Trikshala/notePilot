import { useState, useEffect } from "react";
import api from "../../services/api";
import "../../styles/Analytics.css";

function Analytics() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const res = await api.get("/quiz/analytics/all");
        setAttempts(res.data || []);
      } catch (err) {
        setError("Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    };
    fetchAttempts();
  }, []);

  if (loading) return <div className="analytics-page"><p className="loading-text">Loading analytics...</p></div>;
  if (error) return <div className="analytics-page"><p className="error-message">{error}</p></div>;

  if (attempts.length === 0) {
    return (
      <div className="analytics-page">
        <div className="analytics-header">
          <h2>Your Progress</h2>
          <p className="subtitle">Track your quiz performance over time.</p>
        </div>
        <div className="empty-analytics">
          <p>🧠 No quiz attempts yet.</p>
          <p>Go to a chapter and take a quiz to start tracking your progress!</p>
        </div>
      </div>
    );
  }

  // ── Compute Stats ──
  const totalAttempts = attempts.length;
  const totalScore = attempts.reduce((sum, a) => sum + a.score, 0);
  const totalQuestions = attempts.reduce((sum, a) => sum + a.total_questions, 0);
  const overallAccuracy = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

  const byDifficulty = { easy: [], medium: [], hard: [] };
  attempts.forEach((a) => {
    if (byDifficulty[a.difficulty]) byDifficulty[a.difficulty].push(a);
  });

  const difficultyStats = Object.entries(byDifficulty).map(([diff, list]) => {
    if (list.length === 0) return { diff, attempts: 0, accuracy: null };
    const correct = list.reduce((sum, a) => sum + a.score, 0);
    const total = list.reduce((sum, a) => sum + a.total_questions, 0);
    return { diff, attempts: list.length, accuracy: Math.round((correct / total) * 100) };
  });

  // Recent 10 attempts for history
  const recentAttempts = [...attempts].slice(0, 10);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const getAccuracyColor = (pct) => {
    if (pct >= 80) return "#386641";
    if (pct >= 60) return "#f0a500";
    return "#c0392b";
  };

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h2>Your Progress</h2>
        <p className="subtitle">Track your quiz performance over time.</p>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">🧠</span>
          <span className="stat-value">{totalAttempts}</span>
          <span className="stat-label">Total Attempts</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">✅</span>
          <span className="stat-value">{totalScore}</span>
          <span className="stat-label">Correct Answers</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🎯</span>
          <span className="stat-value">{overallAccuracy}%</span>
          <span className="stat-label">Overall Accuracy</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📝</span>
          <span className="stat-value">{totalQuestions}</span>
          <span className="stat-label">Questions Attempted</span>
        </div>
      </div>

      {/* Difficulty Breakdown */}
      <div className="analytics-section">
        <h3>Performance by Difficulty</h3>
        <div className="difficulty-grid">
          {difficultyStats.map(({ diff, attempts: count, accuracy }) => (
            <div key={diff} className={`difficulty-card ${diff}`}>
              <div className="difficulty-top">
                <span className={`difficulty-badge ${diff}`}>
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </span>
                <span className="diff-attempts">{count} attempt{count !== 1 ? "s" : ""}</span>
              </div>
              {accuracy !== null ? (
                <>
                  <div className="accuracy-bar-bg">
                    <div
                      className="accuracy-bar-fill"
                      style={{
                        width: `${accuracy}%`,
                        backgroundColor: getAccuracyColor(accuracy),
                      }}
                    />
                  </div>
                  <span className="accuracy-pct" style={{ color: getAccuracyColor(accuracy) }}>
                    {accuracy}% accuracy
                  </span>
                </>
              ) : (
                <p className="no-attempts-text">No attempts yet</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Attempts Table */}
      <div className="analytics-section">
        <h3>Recent Attempts</h3>
        <div className="attempts-table">
          <div className="table-header">
            <span>Date</span>
            <span>Difficulty</span>
            <span>Score</span>
            <span>Accuracy</span>
          </div>
          {recentAttempts.map((a) => {
            const pct = Math.round((a.score / a.total_questions) * 100);
            return (
              <div key={a.id} className="table-row">
                <span className="table-date">{formatDate(a.created_at)}</span>
                <span className={`difficulty-badge ${a.difficulty}`}>
                  {a.difficulty.charAt(0).toUpperCase() + a.difficulty.slice(1)}
                </span>
                <span className="table-score">
                  {a.score} / {a.total_questions}
                </span>
                <span className="table-accuracy" style={{ color: getAccuracyColor(pct) }}>
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Analytics;