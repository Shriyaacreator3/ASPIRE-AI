import MiniLofiPlayer from "./MiniLofiPlayer";
import "./dashboard.css";
import { useNavigate } from "react-router-dom";

export function Home() {
  const userMood = "happy";
  const navigate = useNavigate(); // Add this line

  return (
    <div className="home-container">
      <header className="navbar">
        <h1>aspirAI 🚀</h1>
      </header>

      <div className="main-content">
        <main className="dashboard">
          <div className="card" onClick={() => navigate("/quizzes")}>📝 Quizzes</div>
          <div className="card">📊 Mood space</div>
          <div className="card"onClick={() => navigate("/chatbox")}>🧠 AI Assistant</div>
          <div className="card"onClick={()=>navigate("/journal")}>📅 Journal entry</div>
          <div className="card" onClick={() => navigate("/Settings")}>⚙ User settings</div>
        </main>

        {/* LoFi Zone */}
        <aside className="lofi-zone">
          <MiniLofiPlayer mood={userMood} />
        </aside>
      </div>
    </div>
  );
}