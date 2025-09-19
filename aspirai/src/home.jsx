import "./dashboard.css";
<<<<<<< HEAD

export function Home() {
  const cards = [
    { title: "Quizzes", icon: "📝" },
    { title: "Projects", icon: "📊" },
    { title: "AI Assistant", icon: "🧠" },
    { title: "Schedule", icon: "📅" },
    { title: "Settings", icon: "⚙" },
  ];

=======
import { useNavigate } from "react-router-dom";
export function Home() {
  const navigate= useNavigate();
>>>>>>> 77dead1b2ef128528009cf52550df7b38d1f1bbc
  return (
    <div className="home-container">
      <header className="navbar">
        <h1>aspirAI 🚀</h1>
        <button>Profile</button>
      </header>

      <main className="dashboard">
<<<<<<< HEAD
        {cards.map((card, idx) => (
          <div key={idx} className="card">
            <div className="card-icon">{card.icon}</div>
            <div className="card-title">{card.title}</div>
          </div>
        ))}
=======
        <div className="card"onClick={() => navigate("/quizzes")}>📝 Quizzes</div>
        <div className="card">📊 Mood space</div>
        <div className="card">🧠 AI Assistant</div>
        <div className="card">📅 Journal entry</div>
        <div className="card">⚙ User settings</div>
>>>>>>> 77dead1b2ef128528009cf52550df7b38d1f1bbc
      </main>
    </div>
  );
}