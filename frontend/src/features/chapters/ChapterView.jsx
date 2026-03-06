import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../../styles/ChapterView.css";
import api from "../../services/api";

function ChapterView() {
  const { id, chapterId } = useParams();

  const [chapter, setChapter] = useState(null);

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        const response = await api.get(`/chapters/${id}/${chapterId}`);
        setChapter(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchChapter();
  }, [chapterId]);

  return (
    <div className="chapter-page">

      {/* Title */}
      <div className="chapter-header">
        <h2>{chapter?.title}</h2>
        <button className="quiz-btn" disabled>
          Take Quiz
        </button>

      </div>

      {/* Main Layout */}
      <div className="chapter-main">

        {/* LEFT PANEL */}
        <div className="left-panel">

          <div className="upload-section">
            <h3>Upload Content</h3>

            <input
              type="file"
              accept=".pdf,.txt"
            />

            <textarea
              placeholder="Or paste text here..."
              rows={4}
            />

            <button className="primary-btn">
              Upload Content
            </button>
          </div>

          <div className="generate-section">
            <h3>Generate Notes</h3>

            <button className="primary-btn" disabled>
              Generate Smart Notes
            </button>
          </div>

        </div>

        {/* RIGHT PANEL */}
        <div className="notes-panel">

          <h3>Generated Notes</h3>

          <div className="notes-window">
            <p>Your generated notes will appear here.</p>
            <p>When notes get long this area scrolls.</p>
          </div>

        </div>

      </div>

      {/* QUIZ BUTTON */}


    </div >
  );
}

export default ChapterView;