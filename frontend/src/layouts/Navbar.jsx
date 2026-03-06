import { useContext, useState, useEffect } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

import "../styles/Navbar.css";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const { id } = useParams();

    const [course, setCourse] = useState(null);

    const handleLogout = () => {
        logout();
        navigate("/");
    }

    useEffect(() => {
        if (!id) {
            setCourse(null);
            return;
        }

        const fetchCourse = async () => {
            try {
                const res = await api.get(`/courses/${id}/`);
                setCourse(res.data);
            } catch (error) {
                console.error("Error fetching course:", error);
            }
        };

        fetchCourse();
    }, [id]);

    return (
        <nav className="dashboard-navbar">
            <div className="navbar-brand">
                {course ? course.title + " Course" : `${user.name}'s NotePilot`}
            </div>
            <ul className="navbar-links">
                <li>
                    <NavLink
                        to="/dashboard/courses"
                        end
                        className={({ isActive }) =>
                            `nav-btn ${isActive ? "active" : ""}`
                        }
                    >
                        Courses
                    </NavLink>
                </li>

                <li>
                    <NavLink
                        to="/dashboard/analytics"
                        className={({ isActive }) =>
                            `nav-btn ${isActive ? "active" : ""}`
                        }
                    >
                        Analytics
                    </NavLink>
                </li>
                <li><button
                    onClick={handleLogout}
                    className="nav-btn logout" >
                    Logout
                </button></li>
            </ul>
        </nav>
    )
}

export default Navbar;