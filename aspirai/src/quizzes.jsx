import { useEffect, useState, useCallback } from "react"; // <-- Import useCallback
import "./quizstyle.css";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useXP } from "./XPContext";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, database } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

export const Quizzes = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [role, setRole] = useState("");

  const { addXP } = useXP();
  const [user, authLoading] = useAuthState(auth);

  // --- NEW: Moved logic into a useCallback function ---
  const fetchRoleAndQuestions = useCallback(async () => {
    if (authLoading) {
      setLoading(true);
      return;
    }
    if (!user) {
      setLoading(false);
      setError("Please log in to take a quiz.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setQuestions([]);
      setAnswers({});
      setScore(null); // <-- Reset score

      // --- Fetch Role from Firestore ---
      const userDocRef = doc(database, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists() || !userDoc.data().role) {
        throw new Error("No role found for your account.");
      }
      const userRole = userDoc.data().role;
      setRole(userRole);

      // --- Fetch Questions using the userRole ---
      const genAI = new GoogleGenerativeAI(
        process.env.REACT_APP_GEMINI_API_KEY
      );
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
      });

      const prompt = `
        You are an expert quiz generator.
        Generate 5 high-quality, multiple-choice quiz questions for a ${userRole}.
        Return ONLY a valid JSON array. Do not include "'''json" or any other text before or after the array.
        Each object in the array must have exactly three keys: "text" (the question), "options" (an array of 4 strings), and "answer" (the string of the correct option).
      `;

      const result = await model.generateContent(prompt);
      
      const dirtyText = result.response.candidates[0].content.parts[0].text;
      const cleanText = dirtyText
        .replace("```json", "")
        .replace("```", "")
        .trim();
      
      const parsedQuestions = JSON.parse(cleanText);
      setQuestions(parsedQuestions);
    } catch (err) {
      console.error("Firebase or Gemini error:", err);
      setError(err.message || "Failed to load quiz.");
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]); // <-- Dependencies for the function

  // --- MODIFIED: useEffect now just calls the function ---
  useEffect(() => {
    fetchRoleAndQuestions();
  }, [fetchRoleAndQuestions]); // <-- Runs once on load

  // ... (NO CHANGES to handleSelect, handleSubmit, getOptionClass) ...
  const handleSelect = (qIndex, option) => {
    if (score !== null) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: option }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.answer) {
        correctCount++;
      }
    });

    const finalScore = (correctCount / questions.length) * 100;
    setScore(finalScore);

    if (finalScore >= 80) addXP(50);
    else if (finalScore >= 50) addXP(25);
    else addXP(10);
  };
  
  // This function already highlights the correct answer!
  const getOptionClass = (q, idx, opt) => {
    if (score === null) {
      return answers[idx] === opt ? "selected" : "";
    }
    const isCorrect = opt === q.answer;
    const isSelected = answers[idx] === opt;
    
    // This line makes the correct answer green
    if (isCorrect) return "correct"; 
    // This line makes your wrong selection red
    if (isSelected && !isCorrect) return "incorrect";
    // This line grays out other wrong answers
    return "disabled"; 
  };
  
  const total = questions.length;
  const answered = Object.keys(answers).length;
  const progress = total > 0 ? Math.round((answered / total) * 100) : 0;

  return (
    <div className="quiz-container">
      <h2 className="quiz-title">
        {role ? `Quiz for ${role} 🚀` : "Quiz Time 🚀"}
      </h2>
      
      {/* ... (Progress bar and text are unchanged) ... */}
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

      {loading && <p className="quiz-loading">Loading Quiz...</p>}
      {error && <p className="quiz-error">Error: {error}</p>}
      {!loading && !error && questions.length === 0 && !authLoading && (
        <p className="quiz-empty">No quiz available.</p>
      )}

      {score !== null && (
        <div className="quiz-score">
          <h3>
            Quiz Completed Pookie! You scored: {score.toFixed(0)}%
          </h3>
          {/* --- NEW: "Next Quiz" Button --- */}
          <button className="quiz-next-btn" onClick={fetchRoleAndQuestions}>
            Generate Next Quiz
          </button>
        </div>
      )}

      <div className="quiz-list">
        {/* ... (The quiz-card map is unchanged) ... */}
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
                    className={`quiz-option ${getOptionClass(q, idx, opt)}`}
                    onClick={() => handleSelect(idx, opt)}
                    disabled={score !== null}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* --- MODIFIED: Hide submit button after score is shown --- */}
      {!loading && questions.length > 0 && score === null && (
        <button
          className="quiz-submit-btn"
          onClick={handleSubmit}
          disabled={answered !== total}
        >
          Submit Quiz
        </button>
      )}
    </div>
  );
};