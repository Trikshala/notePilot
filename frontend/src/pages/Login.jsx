import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../index.css";


function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !formData.email ||
            !formData.password
        ) {
            setError("* All fields are required");
            return;
        }
        try {
            const response = await api.post("/users/login", {
                email: formData.email,
                password: formData.password
            });
            const token = response.data.access_token;
            localStorage.setItem("token", token)
            console.log("Login Successful!")
            navigate("/dashboard")
        } catch (err) {
            if (err.response?.status === 401) {
                setError("Invalid Email or Password!");
            }
            else {
                setError("Login Failed. Please try again.")
            }
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="title">Welcome Back</h2>
                <p className="subtitle">
                    Login to your account to get started!
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="auth-form"
                    autoComplete="off"
                >

                    <input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        autoComplete="email"
                        onChange={handleChange}
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        autoComplete="new-password"
                        onChange={handleChange}
                    />

                    {error && <p className="error-message">{error}</p>}

                    <button type="submit" className="auth-button">
                        Login
                    </button>
                </form>
                <p className="auth-redirect">
                    New user?{" "}
                    <span onClick={() => navigate("/register")}>
                        Register Now
                    </span>
                </p>
            </div>
        </div>
    );
}

export default Login;