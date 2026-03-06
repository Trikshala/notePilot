import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { FaEye, FaEyeSlash } from "react-icons/fa"
import { AuthContext } from "../../context/AuthContext";


function Register() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "student"
  });

  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("* All fields are required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("x Passwords do not match");
      return;
    }

    try {
      const response = await api.post("/users/register", {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        user_type: formData.role
      });

      const token = response.data.access_token;
      await login(token);
      navigate("/dashboard");
      console.log("Registered:", response.data);

    } catch (err) {
      if (err.response?.status === 400) {
        setError(err.response.data.detail);
      } else {
        setError("Registration failed. Try again.");
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="title">Create Account</h2>
        <p className="subtitle">
          Sign up now and start your journey!
        </p>

        <form
          onSubmit={handleSubmit}
          className="auth-form"
          autoComplete="off"
        >
          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            autoComplete="email"
            onChange={handleChange}
          />

          <input
            type="tel"
            name="phone"
            placeholder="Enter your phone number"
            value={formData.phone}
            autoComplete="tel"
            onChange={handleChange}
          />

          <div className="password-wrapper">

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              autoComplete="new-password"
              onChange={handleChange}
            />

            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>

          </div>

          <div className="password-wrapper">

            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              autoComplete="new-password"
              onChange={handleChange}
            />

            <span
              className="toggle-password"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>

          </div>

          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="role"
                value="student"
                checked={formData.role === "student"}
                onChange={handleChange}
              />
              Student
            </label>

            <label>
              <input
                type="radio"
                name="role"
                value="selfLearner"
                checked={formData.role === "selfLearner"}
                onChange={handleChange}
              />
              Self Learner
            </label>
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="auth-button">
            Register
          </button>
        </form>
        <p className="auth-redirect">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;