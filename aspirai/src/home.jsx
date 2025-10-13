
import { Link } from "react-router-dom";
import "./dashboard.css";
import { useNavigate } from "react-router-dom";

export function Home() {
  const navigate = useNavigate(); // Add this line

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
          <div className="card" onClick={()=>navigate("/lofi")}>Lofi zone</div>
          <div className="card"onClick={() => navigate("/chatbox")}>🧠 AI Assistant</div>
          <div className="card"onClick={()=>navigate("/journal")}>📅 Journal entry</div>
          <div className="card" onClick={() => navigate("/mock-interview")}>🎤 Mock Interviews</div>
          <div className="card" onClick={() => navigate("/Settings")}>⚙ User settings</div>
        </main>
      </div>
    </div>
  );
}