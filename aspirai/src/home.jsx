
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "./dashboard.css";
import TargetCursor from "./TargetCursor"; 
export function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <TargetCursor 
        spinDuration={2}
        hideDefaultCursor={true}
      />
      <header className="navbar">
        <Link to="/" className="arrow-btn" aria-label="Back to home">
          ←
        </Link>
        <h1>aspirAI 🚀</h1>
      </header>

      <div className="main-content">
        <main className="dashboard">
          <div className="card cursor-target" onClick={() => navigate("/quizzes")}>📝 Quizzes</div>
          <div className="card cursor-target" onClick={() => navigate("/lofi")}>Lofi zone</div>
      
          <div className="card cursor-target" onClick={() => navigate("/journal")}>📅 Journal entry</div>
          <div className="card cursor-target" onClick={() => navigate("/mock-interview")}>🎤 Mock Interviews</div>
          <div className="card cursor-target" onClick={() => navigate("/settings")}>⚙ User settings</div>

          {/* ✅ New Resume Checker Card */}
          <div className="card cursor-target" onClick={() => navigate("/resume-checker")}>
            📄 Resume Checker
          </div>
        </main>
      </div>
    </div>
  );
}

