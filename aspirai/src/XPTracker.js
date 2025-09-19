import "./xptracker.css";

export default function XPTracker({ xp, maxXp, showConfetti }) {
  const xPercent = Math.min((xp / maxXp) * 100, 100);

  return (
    <div className="xp-container">
      <h3>Profile XP</h3>

      <div className="xp-bar">
        <div className="xp-fill" style={{ width: `${xPercent}%` }}></div>
      </div>

      <p>
        XP: <span className="xp-number">{xp}</span> / {maxXp}{' '}
        {xp === maxXp && "Max!"}
      </p>

      {showConfetti && <div className="confetti">🎉</div>}
    </div>
  );
}