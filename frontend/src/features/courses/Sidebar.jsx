import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import FormModal from "../../components/FormModal";
import DeleteModal from "../../components/DeleteModal"
import "../../styles/Sidebar.css";
import api from "../../services/api";

function Sidebar() {

    const { id } = useParams();

    const [course, setCourse] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState("add");
    const [selectedChapter, setSelectedChapter] = useState(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [chapterToDelete, setChapterToDelete] = useState(null);
    const [toast, setToast] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const courseRes = await api.get(`/courses/${id}/`);
                setCourse(courseRes.data);

                const chaptersRes = await api.get(`/chapters/${id}/`);
                console.log("Chapters response:", chaptersRes.data);
                setChapters(chaptersRes.data);

            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [id]);

    const handleAddChapter = () => {
        setSelectedChapter(null);
        setModalMode("add");
        setShowModal(true);
    }

    const handleEditChapter = (chapter) => {
        setSelectedChapter(chapter);
        setModalMode("edit");
        setShowModal(true);
    }

    const handleDeleteChapter = (chapter) => {
        setChapterToDelete(chapter);
        setShowDeleteModal(true);
    }

    const handleVisitChapter = (chapter) => {
        navigate(`/dashboard/courses/${id}/${chapter.id}`);
    }

    const handleSubmitChapter = async (formdata) => {

        try {
            if (modalMode === "add") {
                const response = await api.post(`/chapters/`, {
                    course_id: id,
                    title: formdata.title
                });
                showToast("Chapter added successfully!");
                setChapters(prev => [...prev, response.data]);
            }
            else if (modalMode === "edit") {
                const response = await api.patch(`/chapters/${id}/${selectedChapter.id}`, {
                    new_title: formdata.title
                });
                showToast("Chapter updated successfully!");
                setChapters(prev => prev.map(c => c.id === selectedChapter.id ? response.data : c));
            }
            setShowModal(false);
        } catch (error) {
            console.error("Error submitting chapter:", error);
        }

    }

    const handleConfirmDelete = async () => {
        try {
            await api.delete(`/chapters/${id}/${chapterToDelete.id}`);
            showToast("Chapter deleted successfully!");

            setChapters(prev =>
                prev.filter(c => c.id !== chapterToDelete.id)
            );

            setShowDeleteModal(false);
            setChapterToDelete(null);
        } catch (error) {
            console.error("Error deleting chapter:", error);
        }
    };

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => {
            setToast(null);
        }, 2500);
    };

    return (
        <div className="course-sidebar">
            <h3 className="sidebar-title">
                {course ? "Chapters" : "Loading..."}
            </h3>

            <button className="add-chapter-btn" onClick={handleAddChapter}>
                + Create Chapter
            </button>

            <div className="chapters-list">
                {chapters.map((chapter) => (
                    <div key={chapter.id} className="chapter-item" onClick={() => handleVisitChapter(chapter)}>
                        <span className="chapter-title">{chapter.order_index}. {chapter.title}</span>
                        <div className="card-actions">
                            <FiEdit2 className="icon edit-icon"
                                title="Edit Chapter"
                                onClick={(e) => { e.stopPropagation(); handleEditChapter(chapter); }} />
                            <FiTrash2 className="icon delete-icon"
                                title="Delete Chapter"
                                onClick={(e) => { e.stopPropagation(); handleDeleteChapter(chapter); }} />
                        </div>
                    </div>
                ))}

                <FormModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onSubmit={handleSubmitChapter}
                    initialValues={selectedChapter || { title: "" }}
                    fields={[
                        { name: "title", type: "text", placeholder: "Chapter Title", required: true }
                    ]}
                    mode={modalMode}
                    entityName="Chapter"
                />

                <DeleteModal
                    isOpen={showDeleteModal}
                    onClose={() => {
                        setShowDeleteModal(false);
                        setChapterToDelete(null);
                    }}
                    onConfirm={handleConfirmDelete}
                    itemName={chapterToDelete?.title}
                    entityName="Chapter"
                />
            </div>
        </div >


    );
}

export default Sidebar;