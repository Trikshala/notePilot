import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/DashboardHome.css";
import { AuthContext } from "../../context/AuthContext";

function DashboardHome() {
    const [courses, setCourses] = useState([]);
    const { user } = useContext(AuthContext);
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    return (
        <div className="dashboard-container">
            {/* Main Content */}
            <div className="dashboard-content">
                {courses.length === 0 ? (
                    <div className="no-courses">
                        <p className="no-courses-text">You have no courses yet.</p>
                        <button className="add-course-btn" >+ Add New Course</button>
                    </div>
                ) : (
                    <div className="courses-grid">
                        {courses.map((course) => (
                            <div key={course.id} className="course-card">
                                <h3 className="course-title">{course.name}</h3>
                                <p className="course-desc">{course.description}</p>
                                <div className="course-buttons">
                                    <button className="visit-btn">Visit Course</button>
                                    <button className="quiz-btn" disabled>Take Quiz</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default DashboardHome;