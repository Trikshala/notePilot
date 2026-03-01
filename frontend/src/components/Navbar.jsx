import { useContext } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import "../css/Navbar.css";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const handleLogout = () => {
        logout();
        navigate("/");
    }

    return (
        <nav className="dashboard-navbar">
            <div className="navbar-brand">{user.name}'s NotePilot</div>
            <ul className="navbar-links">
                <li>
                    <Link
                        to="/dashboard/courses"
                        className={`nav-btn ${location.pathname === "/dashboard/courses" ? "active" : ""}`}
                    >
                        Courses
                    </Link>
                </li>

                <li>
                    <Link
                        to="/dashboard/analytics"
                        className={`nav-btn ${location.pathname === "/dashboard/analytics" ? "active" : ""}`}
                    >
                        Analytics
                    </Link>
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