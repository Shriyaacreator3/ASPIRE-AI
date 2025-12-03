import { useState, useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./mockInterview.css";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useXP } from "./XPContext";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

const initialScore = {
  confidence: 0,
  englishSkill: 0,
  accuracy: 0,
  timing: 0,
};

function Penguin({ animationState }) {
  const idleGLB = useGLTF("/models/idle.glb");
  const talkingGLB = useGLTF("/models/PENGUIN.glb");
  const mixer = useRef(null);

  const { scene, animations } =
    animationState === "talking" ? talkingGLB : idleGLB;

  useEffect(() => {
    if (!animations || !scene) return;
    mixer.current = new THREE.AnimationMixer(scene);
    const clip = animations[0];
    if (clip) {
      const action = mixer.current.clipAction(clip);
      action.reset().play();
    }
    return () => {
      if (mixer.current) mixer.current.stopAllAction();
    };
  }, [animations, scene]);

  useFrame((state, delta) => {
    if (mixer.current) mixer.current.update(delta);
  });

  return <primitive object={scene} position={[0, -3, 0]} />;
}

export function MockInterview() {
  const [role, setRole] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(-1);
  const [interviewActive, setInterviewActive] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [recognitionActive, setRecognitionActive] = useState(false);
  const [currentRating, setCurrentRating] = useState(initialScore);
  const [totalScore, setTotalScore] = useState(0);
  const [questionSpoken, setQuestionSpoken] = useState(false);
  const [penguinAnimation, setPenguinAnimation] = useState("idle");
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);
  const { addXP } = useXP();
  const [allResults, setAllResults] = useState([]);
  const evaluationLock = useRef(false);
  const evaluatedSetRef = useRef(new Set());
  const startTimeRef = useRef(0);

  // ✅ Declare ALL hooks FIRST (unconditionally)
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const genAIRef = useRef(null);
  const modelRef = useRef(null);

  // ✅ ALL useEffect calls BEFORE any conditional returns
  useEffect(() => {
    setUserAnswer(transcript);
  }, [transcript]);

  useEffect(() => {
    try {
      const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
      genAIRef.current = genAI;
      modelRef.current = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    } catch (err) {
      console.warn("Gemini init failed:", err);
    }
  }, []);

  // ✅ ALL useCallback calls BEFORE any conditional returns
  const evaluateAnswer = useCallback(
    async (question, answer, rawConfidence, rawTime) => {
      if (evaluatedSetRef.current.has(currentQIndex)) return;

      evaluatedSetRef.current.add(currentQIndex);
      evaluationLock.current = true;

      const timeElapsed = rawTime;
      let timingPoints = 0;
      if (timeElapsed > 0) timingPoints = timeElapsed < 6 ? 5 : timeElapsed <= 15 ? 3 : 1;

      const evalPrompt = `You are an expert interview performance rater.
The question was: "${question}".
The user's answer: "${answer}".
Rate accuracy and English skill from 1 to 5 and return JSON:
{ "accuracy_rating": <int>, "english_skill_rating": <int> }`;

      let finalRating = { ...initialScore, timing: timingPoints };
      let pointsAwarded = 0;

      try {
        const model = modelRef.current;
        if (model) {
          const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: evalPrompt }] }],
            generationConfig: { responseMimeType: "application/json" },
          });

          let jsonText = "";
          if (typeof result.text === "function") jsonText = await result.text();
          else if (typeof result.text === "string") jsonText = result.text;
          else if (result?.response?.candidates?.[0]?.content?.parts?.[0]?.text)
            jsonText = result.response.candidates[0].content.parts[0].text;

          if (jsonText) {
            const aiRating = JSON.parse(jsonText.trim());
            const confidencePoints =
              rawConfidence >= 0.9 ? 5 : rawConfidence >= 0.7 ? 3 : rawConfidence > 0 ? 1 : 0;

            finalRating = {
              confidence: confidencePoints,
              englishSkill: aiRating.english_skill_rating ?? 0,
              accuracy: aiRating.accuracy_rating ?? 0,
              timing: timingPoints,
            };
            pointsAwarded = Object.values(finalRating).reduce((a, b) => a + b, 0);
          }
        } else {
          finalRating = {
            confidence: rawConfidence > 0 ? 3 : 0,
            englishSkill: 3,
            accuracy: 3,
            timing: timingPoints,
          };
          pointsAwarded = Object.values(finalRating).reduce((a, b) => a + b, 0);
        }
      } catch (err) {
        console.error("Evaluation error:", err);
      }

      setAllResults((prev) => [
        ...prev,
        {
          qIndex: currentQIndex,
          question,
          answer,
          rating: finalRating,
          points: pointsAwarded,
          time: typeof rawTime === "number" ? rawTime.toFixed(2) : String(rawTime),
        },
      ]);

      try {
        if (typeof addXP === "function" && pointsAwarded > 0) addXP(pointsAwarded);
      } catch {}
    },
    [currentQIndex, addXP]
  );

  const generateQuestions = useCallback(async () => {
  if (!role) return alert("Please enter a role!");

  setLoading(true);
  setQuestions([]);
  setInterviewActive(false);
  setCurrentQIndex(-1);
  setTotalScore(0);
  setCurrentRating(initialScore);
  setUserAnswer("");
  setQuestionSpoken(false);
  setAllResults([]);
  evaluatedSetRef.current.clear();
  evaluationLock.current = false;

  try {
    const model = modelRef.current;

    if (!model) throw new Error("Gemini model not initialized. Check API key.");

    const prompt = `
      You are an expert interviewer.

      Generate EXACTLY 5 interview questions for a candidate applying for:
      **${role}**

      Requirements:
      - Questions must be 1 sentence each
      - No numbering
      - No bullet points
      - No introduction text
      - Only raw questions separated by newlines
    `;

    // NEW SDK CORRECT CALL
    const result = await model.generateContent(prompt);

    // NEW SDK RESULT FORMAT (WORKS REACT 19 + FLASH)
    const rawText = await result.response.text();

    if (!rawText || !rawText.trim()) {
      throw new Error("Gemini returned empty output");
    }

    const split = rawText
      .split("\n")
      .map((q) => q.trim())
      .filter((q) => q.length > 0)
      .slice(0, 5);

    if (split.length < 5) throw new Error("Incomplete questions from model");

    setQuestions(split);
    setInterviewActive(true);
    setCurrentQIndex(0);
    addXP?.(20);
  } catch (err) {
    console.error("Generate questions failed:", err);
    alert("Question generation failed: " + err.message);
    setInterviewActive(false);
  } finally {
    setLoading(false);
  }
}, [role, addXP]);

  const stopListeningManually = useCallback(() => {
    SpeechRecognition.stopListening();
    setRecognitionActive(false);
    clearInterval(timerRef.current);

    const timeTaken = (Date.now() - startTimeRef.current) / 1000;

    evaluateAnswer(
      questions[currentQIndex],
      transcript.trim() || "No response",
      1,
      timeTaken
    );
  }, [questions, currentQIndex, transcript, evaluateAnswer]);

  const startListening = useCallback(() => {
    resetTranscript();
    setUserAnswer("");
    setRecognitionActive(true);
    startTimeRef.current = Date.now();
    setTimer(30);

    SpeechRecognition.startListening({
      continuous: true,
      interimResults: true,
      language: "en-US",
    });

    timerRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          stopListeningManually();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, [resetTranscript, stopListeningManually]);

  const nextQuestion = useCallback(() => {
    evaluationLock.current = false;
    SpeechRecognition.stopListening();
    clearInterval(timerRef.current);

    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex((p) => p + 1);
      setCurrentRating(initialScore);
      setUserAnswer("");
      setQuestionSpoken(false);
      setTimer(30);
    } else {
      setInterviewActive(false);
      setCurrentQIndex(-2);
      const finalScore = allResults.reduce((s, r) => s + (r.points || 0), 0);
      setTotalScore(finalScore);
    }
  }, [currentQIndex, questions.length, allResults]);

  const speakQuestion = useCallback(
    (question) => {
      if (!window.speechSynthesis) return;
      setPenguinAnimation("talking");
      const utterance = new SpeechSynthesisUtterance(question);
      utterance.lang = "en-US";
      utterance.rate = 0.95;

      utterance.onend = () => {
        setPenguinAnimation("idle");
        setQuestionSpoken(true);
        startListening();
      };

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    },
    [startListening]
  );

  useEffect(() => {
    if (interviewActive && currentQIndex >= 0 && !questionSpoken) {
      if (questions[currentQIndex]) {
        speakQuestion(questions[currentQIndex]);
      }
    }
  }, [currentQIndex, interviewActive, questionSpoken, questions, speakQuestion]);

  // ✅ NOW check browser support AFTER all hooks (conditional rendering only)
  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="mock-container">
        <div className="interview-ui">
          <h2>❌ Browser Error</h2>
          <p>Your browser doesn't support speech recognition. Please use Chrome or Edge.</p>
        </div>
      </div>
    );
  }

  const maxPoints = questions.length * 20;

  return (
    <div className="mock-container">
      <div className="mock-split">
        <div className="penguin-canvas" aria-hidden>
          <Canvas>
            <ambientLight intensity={1.5} />
            <directionalLight position={[5, 5, 5]} intensity={3.0} />
            <Penguin animationState={penguinAnimation} />
            <OrbitControls enableZoom={false} />
          </Canvas>
        </div>

        <div className="interview-ui">
          <h2>🎤 Mock Interview</h2>

          {currentQIndex === -1 && !interviewActive && (
            <div className="role-input">
              <input
                placeholder="Enter Role (e.g. Data Scientist)"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
              />
              <button onClick={generateQuestions} disabled={loading}>
                {loading ? "Generating..." : "Start Interview"}
              </button>
            </div>
          )}

          {interviewActive && currentQIndex >= 0 && (
            <>
              <h3>
                Question {currentQIndex + 1} of {questions.length}
              </h3>
              <p className="question-text">Q: {questions[currentQIndex]}</p>

              <p className="mic-listening">
                {listening ? "🔴 Listening..." : "The penguin is speaking..."}
                &nbsp; | Time Left: {timer}s
              </p>

              <div className="user-answer-display">
                <p className="user-answer-label">Your Answer:</p>
                <p className="user-answer-text">
                  {userAnswer || "(waiting for speech...)"}
                </p>
              </div>

              {listening && (
                <button className="stop-btn" onClick={stopListeningManually}>
                  Stop
                </button>
              )}

              <div style={{ marginTop: 12 }}>
                <button onClick={nextQuestion} className="nextbtn">
                  Next
                </button>
              </div>
            </>
          )}

          {currentQIndex === -2 && (
            <div className="final-summary">
              <h3>Interview Complete! 🎉</h3>
              <div className="score-display">
                <p className="score-text">
                  Your overall performance score is <strong>{totalScore}</strong> out
                  of <strong>{maxPoints}</strong>
                </p>
                <p className="score-percentage">
                  ({Math.round((totalScore / maxPoints) * 100)}%)
                </p>
              </div>

              <table className="results-table">
                <thead>
                  <tr>
                    <th>Q#</th>
                    <th>Question</th>
                    <th>Your Answer</th>
                    <th>Time (s)</th>
                    <th>Accuracy</th>
                    <th>English</th>
                    <th>Timing</th>
                    <th>Total Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {allResults.map((res, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td className="cell-question">{res.question}</td>
                      <td className="cell-answer">{res.answer}</td>
                      <td>{res.time}</td>
                      <td>{res.rating?.accuracy ?? "-"}</td>
                      <td>{res.rating?.englishSkill ?? "-"}</td>
                      <td>{res.rating?.timing ?? "-"}</td>
                      <td className="cell-total">
                        <strong>{res.points}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button
                className="nextbtn"
                onClick={generateQuestions}
                disabled={loading}
              >
                Generate Next Set of Questions
              </button>
            </div>
          )}

          {loading && <p>Processing question... Please wait.</p>}
        </div>
      </div>
    </div>
  );
}
