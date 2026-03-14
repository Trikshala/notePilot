import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../services/api";
import "../../styles/ChapterView.css";

const MAX_DOCS_PER_CHAPTER = 2;
const MAX_PDF_SIZE = 5 * 1024 * 1024;

function ChapterView() {
  const { id, chapterId } = useParams();
  const navigate = useNavigate();

  const [chapter, setChapter] = useState(null);
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [activeTab, setActiveTab] = useState("notes"); // "notes" | "quiz"

  // Notes state
  const [noteStyle, setNoteStyle] = useState("bullet");
  const [noteLength, setNoteLength] = useState("medium");
  const [note, setNote] = useState(null);
  const [generatingNotes, setGeneratingNotes] = useState(false);
  const [notesError, setNotesError] = useState("");

  // Quiz state
  const [quizDifficulty, setQuizDifficulty] = useState("medium");
  const [numQuestions, setNumQuestions] = useState(5);
  const [startingQuiz, setStartingQuiz] = useState(false);
  const [quizError, setQuizError] = useState("");

  // Upload state
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
  // These run SYNCHRONOUSLY and immediately clear old data
  setChapter(null);
  setUploadedDocs([]);
  setNote(null);
  setNotesError("");
  setQuizError("");

  const fetchData = async () => {
    try {
      const chapterRes = await api.get(`/chapters/${id}/${chapterId}`);
      setChapter(chapterRes.data);

      const docsRes = await api.get(`/documents/${chapterId}`);
      setUploadedDocs(docsRes.data || []);

      try {
        const noteRes = await api.get(`/notes/${chapterId}`);
        setNote(noteRes.data);
      } catch (error) {
        if (error.response?.status !== 404) {
          console.error("Error fetching note:", error);
        }
      }
    } catch (error) {
      console.error("Error fetching chapter data:", error);
    }
  };

  fetchData();
}, [chapterId, id]);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (uploadedDocs.length + files.length > MAX_DOCS_PER_CHAPTER) {
      alert(`Max ${MAX_DOCS_PER_CHAPTER} documents per chapter.`);
      e.target.value = null;
      return;
    }

    for (let file of files) {
      if (file.size > MAX_PDF_SIZE) {
        alert(`"${file.name}" exceeds 5MB.`);
        e.target.value = null;
        return;
      }
    }

    setUploading(true);
    try {
      for (let file of files) {
        const formData = new FormData();
        formData.append("file", file);
        await api.post(`/documents/${chapterId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      const docsRes = await api.get(`/documents/${chapterId}`);
      setUploadedDocs(docsRes.data || []);
    } catch (err) {
      alert(err.response?.data?.detail || "Upload failed.");
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const handleDeleteDoc = async (docId) => {
    try {
      await api.delete(`/documents/${docId}`);
      setUploadedDocs((prev) => prev.filter((d) => d.id !== docId));
    } catch (err) {
      alert("Failed to delete document.");
    }
  };

  const handleGenerateNotes = async () => {
    setGeneratingNotes(true);
    setNotesError("");
    try {
      const res = await api.post(`/notes/${chapterId}`, {
        style: noteStyle,
        length: noteLength,
      });
      setNote(res.data);
    } catch (err) {
      setNotesError(err.response?.data?.detail || "Failed to generate notes.");
    } finally {
      setGeneratingNotes(false);
    }
  };

  const handleDeleteNote = async () => {
    try {
      await api.delete(`/notes/${chapterId}`);
      setNote(null);
    } catch (err) {
      alert("Failed to delete note.");
    }
  };

  const handleStartQuiz = async () => {
    setStartingQuiz(true);
    setQuizError("");
    try {
      const res = await api.post(`/quiz/${chapterId}/generate`, {
        difficulty: quizDifficulty,
        num_questions: numQuestions,
      });
      // Navigate to quiz page, passing questions via state
      navigate(`/quiz/${chapterId}`, {
        state: {
          questions: res.data.questions,
          difficulty: quizDifficulty,
          chapterId,
          chapterTitle: chapter?.title,
        },
      });
    } catch (err) {
      setQuizError(err.response?.data?.detail || "Failed to generate quiz.");
    } finally {
      setStartingQuiz(false);
    }
  };

  const renderNoteContent = (content) => {
    if (!content) return null;
    return content.split("\n").map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return <h4 key={i} className="note-heading">{line.replace(/\*\*/g, "")}</h4>;
      }
      if (line.startsWith("•") || line.startsWith("-")) {
        return <li key={i} className="note-bullet">{line.replace(/^[•\-]\s*/, "").replace(/\*\*(.*?)\*\*/g, "$1")}</li>;
      }
      if (line.trim() === "") return <br key={i} />;
      // Replace **bold** inline
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i} className="note-para">
          {parts.map((part, j) =>
            j % 2 === 1 ? <strong key={j}>{part}</strong> : part
          )}
        </p>
      );
    });
  };

  return (
    <div className="chapter-page">
      {/* Header */}
      <div className="chapter-header">
        <div className="chapter-header-left">
          <button className="back-btn" onClick={() => navigate(`/courses/${id}`)}>
            ← Back
          </button>
          <h2>{chapter?.title || "Loading..."}</h2>
        </div>
      </div>

      {/* Main Layout */}
      <div className="chapter-main">
        {/* LEFT PANEL — Documents */}
        <div className="left-panel">
          <div className="upload-section">
            <h3>Study Material</h3>
            <p className="section-hint">Upload up to 2 PDFs or TXT files</p>

            {uploadedDocs.length < MAX_DOCS_PER_CHAPTER && (
              <label className="upload-label">
                {uploading ? "Uploading..." : "＋ Upload File"}
                <input
                  type="file"
                  accept=".pdf,.txt"
                  multiple
                  onChange={handleFileUpload}
                  disabled={uploading}
                  style={{ display: "none" }}
                />
              </label>
            )}

            {uploadedDocs.length > 0 ? (
              <ul className="doc-list">
                {uploadedDocs.map((doc) => (
                  <li key={doc.id} className="doc-item">
                    <span className="doc-icon">
                      {doc.source_type === "pdf" ? "📄" : "📝"}
                    </span>
                    <span className="doc-name">{doc.file_name}</span>
                    <button
                      className="doc-delete"
                      onClick={() => handleDeleteDoc(doc.id)}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-docs">No documents uploaded yet.</p>
            )}
          </div>
        </div>

        {/* RIGHT PANEL — Tabs */}
        <div className="right-panel">
          {/* Tab Switcher */}
          <div className="tab-bar">
            <button
              className={`tab-btn ${activeTab === "notes" ? "active" : ""}`}
              onClick={() => setActiveTab("notes")}
            >
              Your Notes
            </button>
            <button
              className={`tab-btn ${activeTab === "quiz" ? "active" : ""}`}
              onClick={() => setActiveTab("quiz")}
            >
              Take Quiz
            </button>
          </div>

          {/* NOTES TAB */}
          {activeTab === "notes" && (
            <div className="tab-content">
              <div className="note-controls">
                <div className="control-group">
                  <label>Style</label>
                  <div className="pill-group">
                    {["bullet", "paragraph", "structured"].map((s) => (
                      <button
                        key={s}
                        className={`pill ${noteStyle === s ? "active" : ""}`}
                        onClick={() => setNoteStyle(s)}
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="control-group">
                  <label>Length</label>
                  <div className="pill-group">
                    {["short", "medium", "long"].map((l) => (
                      <button
                        key={l}
                        className={`pill ${noteLength === l ? "active" : ""}`}
                        onClick={() => setNoteLength(l)}
                      >
                        {l.charAt(0).toUpperCase() + l.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  className="primary-btn generate-btn"
                  onClick={handleGenerateNotes}
                  disabled={generatingNotes || uploadedDocs.length === 0}
                >
                  {generatingNotes ? (
                    <span className="btn-loading">
                      <span className="spinner" /> Generating...
                    </span>
                  ) : note ? "Regenerate Notes" : "Generate Notes"}
                </button>

                {notesError && <p className="error-message">{notesError}</p>}
                {uploadedDocs.length === 0 && (
                  <p className="hint-message">Upload a document first to generate notes.</p>
                )}
              </div>

              {/* Notes Display */}
              <div className="notes-window">
                {note ? (
                  <>
                    <div className="notes-meta">
                      <span className="note-badge">{note.style}</span>
                      <span className="note-badge">{note.length}</span>
                      <button className="delete-note-btn" onClick={handleDeleteNote}>
                        Delete
                      </button>
                    </div>
                    <div className="notes-content">
                      {renderNoteContent(note.content)}
                    </div>
                  </>
                ) : (
                  <div className="notes-empty">
                    <p>Your notes will appear here.</p>
                    <p>Select a style and length, then hit Generate.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* QUIZ TAB */}
          {activeTab === "quiz" && (
            <div className="tab-content">
              <div className="quiz-controls">
                <p className="section-hint">
                  Generate a quiz from your uploaded documents.
                </p>

                <div className="control-group">
                  <label>Difficulty</label>
                  <div className="pill-group">
                    {["easy", "medium", "hard"].map((d) => (
                      <button
                        key={d}
                        className={`pill difficulty-pill ${quizDifficulty === d ? `active ${d}` : ""}`}
                        onClick={() => setQuizDifficulty(d)}
                      >
                        {d.charAt(0).toUpperCase() + d.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="control-group">
                  <label>Number of Questions</label>
                  <div className="pill-group">
                    {[3, 5, 10].map((n) => (
                      <button
                        key={n}
                        className={`pill ${numQuestions === n ? "active" : ""}`}
                        onClick={() => setNumQuestions(n)}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  className="primary-btn generate-btn"
                  onClick={handleStartQuiz}
                  disabled={startingQuiz || uploadedDocs.length === 0}
                >
                  {startingQuiz ? (
                    <span className="btn-loading">
                      <span className="spinner" /> Generating Quiz...
                    </span>
                  ) : "Start Quiz →"}
                </button>

                {quizError && <p className="error-message">{quizError}</p>}
                {uploadedDocs.length === 0 && (
                  <p className="hint-message">Upload a document first to take a quiz.</p>
                )}
              </div>

              <div className="quiz-info-box">
                <h4>How it works</h4>
                <ul>
                  <li>Questions are generated from your uploaded documents</li>
                  <li>Answer one question at a time</li>
                  <li>See your score and explanations at the end</li>
                  <li>Your attempts are saved for progress tracking</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChapterView;