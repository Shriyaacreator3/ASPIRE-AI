import "./dashboard.css";
import { useNavigate } from "react-router-dom";
export function Home() {
  const navigate= useNavigate();
  return (
    <div className="home-container">
      <header className="navbar">
        <h1>aspirAI 🚀</h1>
        <button>Profile</button>
      </header>

      <main className="dashboard">
        <div className="card"onClick={() => navigate("/quizzes")}>📝 Quizzes</div>
        <div className="card">📊 Mood space</div>
        <div className="card">🧠 AI Assistant</div>
        <div className="card">📅 Journal entry</div>
        <div className="card">⚙ User settings</div>
      </main>
    </div>
  );
}