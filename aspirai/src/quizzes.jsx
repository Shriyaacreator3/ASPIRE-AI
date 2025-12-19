import { useEffect, useState, useCallback } from "react";
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
  const [isStarted, setIsStarted] = useState(false); 

  const { addXP } = useXP();
  const [user, authLoading] = useAuthState(auth);

  useEffect(() => {
    const fetchDefaultRole = async () => {
      if (authLoading || !user) return;
      try {
        const userDocRef = doc(database, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().role) {
          setRole(userDoc.data().role);
        }
      } catch (err) {
        console.error("Firestore error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDefaultRole();
  }, [user, authLoading]);

  const fetchQuestions = useCallback(async () => {
    if (!role.trim()) {
      setError("Please enter a role to generate a quiz.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setScore(null);
      setAnswers({});
      const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `Generate 5 high-quality, multiple-choice quiz questions for a ${role}.
       Return ONLY a valid JSON array. Each object must have "text", "options" (4 strings), and "answer".`;
      const result = await model.generateContent(prompt);
      const dirtyText = result.response.candidates[0].content.parts[0].text;
      const cleanText = dirtyText.replace(/```json|```/g, "").trim();
      setQuestions(JSON.parse(cleanText));
      setIsStarted(true); 
    } catch (err) {
      setError("Failed to load quiz. Try again!");
    } finally {
      setLoading(false);
    }
  }, [role]);

  const handleSelect = (qIndex, option) => {
    if (score !== null) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: option }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.answer) correctCount++;
    });
    const finalScore = (correctCount / questions.length) * 100;
    setScore(finalScore);
    if (finalScore >= 80) addXP(50);
    else if (finalScore >= 50) addXP(25);
    else addXP(10);
  };

  const getOptionClass = (q, idx, opt) => {
    if (score === null) return answers[idx] === opt ? "selected" : "";
    if (opt === q.answer) return "correct";
    if (answers[idx] === opt) return "incorrect";
    return "disabled";
  };

  if (authLoading) return <div className="page-wrapper">Loading...</div>;

  return (
    <div className="page-wrapper">
      {!isStarted ? (
        /* --- SETUP CARD: Standalone, no outer box --- */
        <div className="quiz-setup-card">
          <h2 className="quiz-title">What do you want to practice today? 🚀</h2>
          <div className="input-group">
            <p className="input-label">Role:</p>
            <input 
              type="text" 
              className="role-input-field"
              value={role} 
              onChange={(e) => setRole(e.target.value)} 
              placeholder="e.g. Mechanical Engineer"
            />
          </div>
          <button className="quiz-generate-btn" onClick={fetchQuestions} disabled={loading}>
            {loading ? "Generating..." : "Generate Quiz"}
          </button>
          {error && <p className="quiz-error">{error}</p>}
        </div>
      ) : (
        /* --- ACTIVE QUIZ VIEW --- */
        <div className="quiz-active-container">
          <button className="change-btn" onClick={() => setIsStarted(false)}>Change Role</button>
          <h2 className="quiz-title">Quiz for {role}</h2>
          
          {questions.map((q, idx) => (
            <div key={idx} className="quiz-card">
              <p className="quiz-question">Q{idx + 1}: {q.text}</p>
              <div className="quiz-options">
                {q.options.map((opt, i) => (
                  <button 
                    key={i} 
                    className={`quiz-option ${getOptionClass(q, idx, opt)}`}
                    onClick={() => handleSelect(idx, opt)}
                    disabled={score !== null}
                  >{opt}</button>
                ))}
              </div>
            </div>
          ))}

          {score === null ? (
            <button className="quiz-submit-btn" onClick={handleSubmit} disabled={Object.keys(answers).length !== questions.length}>
              Submit Quiz
            </button>
          ) : (
            <div className="quiz-score-section">
               <h3>Final Score: {score.toFixed(0)}%</h3>
               <button className="quiz-next-btn" onClick={fetchQuestions}>Next Quiz</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};