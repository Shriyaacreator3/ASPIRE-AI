import { useEffect, useState } from "react";
import "./quizstyle.css";

export const Quizzes = ({ role }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({}); // track selected answers

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError(null);

        // Example API endpoint
        const res = await fetch(`/api/quizzes?role=${role}`);
        if (!res.ok) throw new Error("Failed to fetch quizzes");

        const data = await res.json();
        setQuestions(data.questions || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (role) {
      fetchQuestions();
    }
  }, [role]);

  const handleSelect = (qIndex, option) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: option }));
  };

  const total = questions.length;
  const answered = Object.keys(answers).length;
  const progress = total > 0 ? Math.round((answered / total) * 100) : 0;

  return (
    <div className="quiz-container">
      <h2 className="quiz-title">Quizzes for {role} 🚀</h2>

      
      {total > 0 && (
        <div className="quiz-progress">
          <div
            className="quiz-progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
      <p className="quiz-progress-text">
        {answered} / {total} answered ({progress}%)
      </p>

      {loading && <p className="quiz-loading">Loading questions...</p>}
      {error && <p className="quiz-error">Error: {error}</p>}

      {!loading && !error && questions.length === 0 && (
        <p className="quiz-empty">No quizzes available for this role.</p>
      )}

      <div className="quiz-list">
        {questions.map((q, idx) => (
          <div key={idx} className="quiz-card">
            <p className="quiz-question">
              Q{idx + 1}: {q.text}
            </p>
            {q.options && (
              <div className="quiz-options">
                {q.options.map((opt, i) => (
                  <button
                    key={i}
                    className={`quiz-option ${
                      answers[idx] === opt ? "selected" : ""
                    }`}
                    onClick={() => handleSelect(idx, opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};