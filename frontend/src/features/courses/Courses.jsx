import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import api from "../../services/api";
import "../../styles/Courses.css";
import FormModal from "../../components/FormModal";
import DeleteModal from "../../components/DeleteModal"

function Courses() {
    const [courses, setCourses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState("add");
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState(null);
    const [toast, setToast] = useState(null);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await api.get("/courses");
                setCourses(response.data);
            } catch (error) {
                console.error("Error fetching courses:", error);
            }
        };

        fetchCourses();
    }, []);

    // useEffect(() => {
    //     setNavbarTitle(`${user.name}'s NotePilot`);
    // }, []);

    const handleAddCourse = () => {
        setSelectedCourse(null);
        setModalMode("add");
        setShowModal(true);
    }
    const handleEditCourse = (course) => {
        setSelectedCourse(course);
        setModalMode("edit");
        setShowModal(true);
    };

    const handleDeleteCourse = (course) => {
        setCourseToDelete(course);
        setShowDeleteModal(true);
    };

    const handleVisitCourse = (course) => {
        navigate(`/dashboard/courses/${course.id}`)
    }

    const handleSubmitCourse = async (formData) => {
        const payload = {
            title: formData.title,
            description: formData.description
        };
        try {
            if (modalMode === "add") {
                const response = await api.post("/courses", payload);
                showToast("Course added successfully!");
                setCourses(prev => [...prev, response.data]);
            }
            else if (modalMode === "edit") {
                const response = await api.put(`/courses/${selectedCourse.id}`, payload);
                showToast("Course updated successfully!");
                setCourses(prev => prev.map(c => c.id === selectedCourse.id ? response.data : c));
            }
            setShowModal(false);

        } catch (error) {
            console.error("Error submitting course:", error);
        }

    }

    const handleConfirmDelete = async () => {
        try {
            await api.delete(`/courses/${courseToDelete.id}`);
            showToast("Course deleted successfully!");

            setCourses(prev =>
                prev.filter(c => c.id !== courseToDelete.id)
            );

            setShowDeleteModal(false);
            setCourseToDelete(null);
        } catch (error) {
            console.error("Error deleting course:", error);
        }
    };

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => {
            setToast(null);
        }, 2500);
    };

    return (
        <div className="dashboard-container">
            {toast && (
                <div className="toast-message">
                    {toast}
                </div>
            )}
            <div className="dashboard-content">
                <div className="courses-header">
                    <button
                        className="add-course-btn"
                        onClick={handleAddCourse}
                    >
                        + Add New Course
                    </button>
                </div>

                {courses.length === 0 ? (
                    <div className="no-courses">
                        <p className="no-courses-text">
                            You have no courses yet. Create now!
                        </p>
                    </div>
                ) : (
                    <div className="courses-grid">
                        {courses.map((course) => (
                            <div key={course.id} className="course-card">

                                <div className="card-header">
                                    <h3 className="course-title">{course.title}</h3>

                                    <div className="card-actions">
                                        <FiEdit2
                                            className="icon edit-icon"
                                            title="Edit Course"
                                            onClick={() => handleEditCourse(course)}
                                        />
                                        <FiTrash2
                                            className="icon delete-icon"
                                            title="Delete Course"
                                            onClick={() => handleDeleteCourse(course)}
                                        />
                                    </div>
                                </div>

                                <p className="course-desc">{course.description}</p>

                                <div className="course-buttons">
                                    <button className="visit-btn" onClick={() => handleVisitCourse(course)}>
                                        Visit Course
                                    </button>

                                    <button className="quiz-btn" disabled>
                                        Revise Course
                                    </button>
                                </div>

                            </div>
                        ))}
                    </div>
                )}


                <FormModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onSubmit={handleSubmitCourse}
                    initialValues={selectedCourse || { title: "", description: "" }}
                    fields={[
                        { name: "title", type: "text", placeholder: "Course Title", required: true },
                        { name: "description", type: "textarea", placeholder: "Course Description", required: false }
                    ]}
                    mode={modalMode}
                    entityName="Course"
                />

                <DeleteModal
                    isOpen={showDeleteModal}
                    onClose={() => {
                        setShowDeleteModal(false);
                        setCourseToDelete(null);
                    }}
                    onConfirm={handleConfirmDelete}
                    itemName={courseToDelete?.title}
                    entityName="Course"
                />

            </div>
        </div>
    );
}

export default Courses;