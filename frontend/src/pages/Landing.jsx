import { useNavigate } from "react-router-dom";
import "../index.css";

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="landing-content">
        <h1>
          Welcome to <span className="highlight">NotePilot</span>,
          <br />
          your one true learning partner.
        </h1>

        <p className="tagline">
          Study smarter.
          <br />
          Learn faster.
          <br />
          Forget nothing.
        </p>

        <div className="button-group">
          <button
            className="primary-btn"
            onClick={() => navigate("/register")}
          >
            Get Started
          </button>

          <button
            className="secondary-btn"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default Landing;