import "./dashboard.css";
export function Home() {
  return (
    <div className="home-container">
      <header className="navbar">
        <h1>aspirAI 🚀</h1>
      </header>

      <main className="dashboard">
        <div className="card">📝 Quizzes</div>
        <div className="card">📊 Projects</div>
        <div className="card">🧠 AI Assistant</div>
        <div className="card">📅 Schedule</div>
        <div className="card">⚙ Settings</div>
      </main>
    </div>
  );
}
