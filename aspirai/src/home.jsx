import "./dashboard.css";

export function Home() {
  const cards = [
    { title: "Quizzes", icon: "📝" },
    { title: "Projects", icon: "📊" },
    { title: "AI Assistant", icon: "🧠" },
    { title: "Schedule", icon: "📅" },
    { title: "Settings", icon: "⚙" },
  ];

  return (
    <div className="home-container">
      <header className="navbar">
        <h1>aspirAI 🚀</h1>
        <button>Profile</button>
      </header>

      <main className="dashboard">
        {cards.map((card, idx) => (
          <div key={idx} className="card">
            <div className="card-icon">{card.icon}</div>
            <div className="card-title">{card.title}</div>
          </div>
        ))}
      </main>
    </div>
  );
}