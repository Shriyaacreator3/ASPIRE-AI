
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "./dashboard.css";

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <header className="navbar">
        <Link to="/" className="arrow-btn" aria-label="Back to home">
          ←
        </Link>
        <h1>aspirAI 🚀</h1>
      </header>

      <div className="main-content">
        <main className="dashboard">
          <div className="card" onClick={() => navigate("/quizzes")}>📝 Quizzes</div>
          <div className="card" onClick={() => navigate("/lofi")}>Lofi zone</div>
          <div className="card" onClick={() => navigate("/chatbox")}>🧠 AI Assistant</div>
          <div className="card" onClick={() => navigate("/journal")}>📅 Journal entry</div>
          <div className="card" onClick={() => navigate("/mock-interview")}>🎤 Mock Interviews</div>
          <div className="card" onClick={() => navigate("/settings")}>⚙ User settings</div>

          {/* ✅ New Resume Checker Card */}
          <div className="card" onClick={() => navigate("/resume-checker")}>
            📄 Resume Checker
          </div>
        </main>
      </div>
    </div>
  );
}
