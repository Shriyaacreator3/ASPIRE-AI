import { useState } from "react";
import "./Personalityquizstyle.css";

// Map each personality type to an icon (can later be SVGs or images)
const typeIcons = {
  ENFJ: "🧚‍♀️",
  INFJ: "🧙‍♂️",
  ENFP: "🦋",
  INFP: "🌸",
  ENTJ: "🦁",
  INTJ: "🧠",
  ENTP: "🌀",
  INTP: "🧪",
  ESFJ: "🤝",
  ISFJ: "🛡️",
  ESFP: "🎉",
  ISFP: "🎨",
  ESTJ: "📋",
  ISTJ: "🏛️",
  ESTP: "⚡",
  ISTP: "🛠️",
};

const getIconForType = (type) => typeIcons[type] || "✨";

const questions = [
  {
    text: "At a weekend party, you usually...",
    options: [
      { text: "Mingle with many people, even strangers", dim: "E" },
      { text: "Stick with a few close friends or stay quiet", dim: "I" },
    ],
  },
  {
    text: "When starting a new project, you mostly focus on...",
    options: [
      { text: "Big ideas and possibilities", dim: "N" },
      { text: "Practical details and what is realistic now", dim: "S" },
    ],
  },
  {
    text: "When a friend asks for advice, you tend to be more...",
    options: [
      { text: "Direct and logical", dim: "T" },
      { text: "Empathetic and focused on feelings", dim: "F" },
    ],
  },
  {
    text: "Your ideal way to plan a trip is...",
    options: [
      { text: "Fixed itinerary, bookings done in advance", dim: "J" },
      { text: "Keep it flexible and decide on the go", dim: "P" },
    ],
  },
  {
    text: "In group projects, you are more likely to...",
    options: [
      { text: "Take charge and coordinate tasks", dim: "E" },
      { text: "Do your part quietly without leading", dim: "I" },
    ],
  },
  {
    text: "You trust more...",
    options: [
      { text: "Patterns, theories, and future possibilities", dim: "N" },
      { text: "Facts, past experience, and data", dim: "S" },
    ],
  },
  {
    text: "During conflicts, you usually...",
    options: [
      { text: "Stick to what seems fair and reasonable", dim: "T" },
      { text: "Prioritize harmony and others' feelings", dim: "F" },
    ],
  },
  {
    text: "Your workspace is usually...",
    options: [
      { text: "Organized with clear to‑do lists", dim: "J" },
      { text: "A bit messy but you know where things are", dim: "P" },
    ],
  },
];

const initialScores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

export default function PersonalityQuiz() {
  const [current, setCurrent] = useState(0);
  const [scores, setScores] = useState(initialScores);
  const [finished, setFinished] = useState(false);

  const handleAnswer = (dim) => {
    setScores((prev) => ({ ...prev, [dim]: prev[dim] + 1 }));

    if (current + 1 < questions.length) {
      setCurrent(current + 1);
    } else {
      setFinished(true);
    }
  };

  const getType = () => {
    const type =
      (scores.E >= scores.I ? "E" : "I") +
      (scores.S >= scores.N ? "S" : "N") +
      (scores.T >= scores.F ? "T" : "F") +
      (scores.J >= scores.P ? "J" : "P");
    return type;
  };

  if (finished) {
    const type = getType();
    const icon = getIconForType(type);

    return (
      <div className="quiz-result-page">
        <div className="quiz-result-card">
          <div className="quiz-result-icon">{icon}</div>
          <h2>Your personality snapshot</h2>
          <p>
            Your 4-letter type (rough hint): <strong>{type}</strong>
          </p>
          <p>
            This is a light, fun quiz only. For a detailed report, you can try a
            full MBTI‑style test.
          </p>
          <a
            href="https://www.16personalities.com/free-personality-test"
            target="_blank"
            rel="noreferrer"
          >
            Take a detailed test on 16Personalities
          </a>
        </div>
      </div>
    );
  }

  const q = questions[current];

  return (
    <div className="quiz-page">
      <div className="quiz-card">
        <h2>Quick Personality Quiz</h2>
        <p>
          Question {current + 1} of {questions.length}
        </p>
        <h3>{q.text}</h3>
        <div className="quiz-options">
          {q.options.map((opt, idx) => (
            <button key={idx} onClick={() => handleAnswer(opt.dim)}>
              {opt.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
