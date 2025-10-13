import { useState } from "react";
import "./mockInterview.css";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useXP } from "./XPContext"; // import XP context

export function MockInterview() {
  const [role, setRole] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addXP } = useXP(); // XP functions

  const generateQuestions = async () => {
    if (!role) return alert("Please enter a role!");
    setLoading(true);
    setQuestions([]);

    try {
      const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `You are an expert interviewer. 
      Generate 5 professional, concise, and realistic interview questions for a ${role}. 
      Format them exactly as:
      1. Question
      2. Question
      3. Question
      4. Question
      5. Question`;

      const result = await model.generateContent(prompt);

      let text = "";
      if (result?.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
        text = result.response.candidates[0].content.parts[0].text;
      } else if (result?.response?.text) {
        text = result.response.text();
      }

      if (!text) throw new Error("Gemini returned no text");

      const splitQuestions = text.split(/\d+\.\s*/).filter((q) => q.trim() !== "");
      setQuestions(splitQuestions.slice(0, 5));

      // Add XP for generating mock interview
      addXP(20); // for example, +20 XP
    } catch (err) {
      console.error("Gemini error:", err);
      alert("Failed to generate questions. Check console for details.");
    }

    setLoading(false);
  };

  return (
    <div className="mock-container">
      <h2>🎤 Mock Interview Generator</h2>
      <p>Choose your desired role and generate tailored interview questions!</p>

      <div className="role-input">
        <input
          type="text"
          placeholder="e.g. Frontend Developer, Data Scientist..."
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
        <button onClick={generateQuestions} disabled={loading}>
          {loading ? "Generating..." : "Generate Questions"}
        </button>
      </div>

      <div className="questions">
        {questions.length > 0 ? (
          <ul>
            {questions.map((q, idx) => (
              <li key={idx}>{q.trim()}</li>
            ))}
          </ul>
        ) : (
          !loading && <p>No questions yet. Try generating one!</p>
        )}
      </div>
    </div>
  );
}