import "../../styles/CourseView.css";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar"


function CourseView() {
    return (
        <div className="course-container">
            <Sidebar />
            <div className="course-main">
                <Outlet />
            </div>

        </div>
    )

}

export default CourseView;