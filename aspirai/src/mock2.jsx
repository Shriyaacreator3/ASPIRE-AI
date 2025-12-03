import { useState, useCallback, useEffect, useRef } from "react";
import "./mockInterview.css";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useXP } from "./XPContext";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

// Initial score
const initialScore = {
  confidence: 0,
  englishSkill: 0,
  accuracy: 0,
  timing: 0,
};

// Speech Recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// Penguin Component that switches GLB based on animation
function Penguin({ animationState }) {
  // Load both GLBs
  const idleGLB = useGLTF("/models/idle.glb");
  const talkingGLB = useGLTF("/models/PENGUIN.glb");
  const mixer = useRef(null);

  // Determine which GLB to show
  const { scene, animations } = animationState === "talking" ? talkingGLB : idleGLB;

  useEffect(() => {
    if (!animations || !scene) return;
    mixer.current = new THREE.AnimationMixer(scene);
    const clip = animations[0];
    const action = mixer.current.clipAction(clip);
    action.reset().play();
    return () => mixer.current.stopAllAction();
  }, [animations, scene]);

  useFrame((state, delta) => {
    if (mixer.current) mixer.current.update(delta);
  });

  return <primitive object={scene} position={[0, -1.5, 0]} />;
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
  const [penguinAnimation, setPenguinAnimation] = useState("idle"); // idle or talking
  const [timer, setTimer] = useState(30);
  const timerRef = useRef(null);
  const { addXP } = useXP();

  // Gemini AI
  const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  // --- Evaluate Answer ---
  const evaluateAnswer = useCallback(
    async (question, answer, rawConfidence, rawTime) => {
      let timingPoints = 0;
      if (rawTime > 0) timingPoints = rawTime < 6 ? 5 : rawTime <= 10 ? 3 : 1;

      const evalPrompt = `You are an expert interview performance rater.
      The question was: "${question}".
      The user's answer: "${answer}".
      Rate Accuracy and English Skill 1-5. Respond ONLY in JSON:
      { "accuracy_rating": <int>, "english_skill_rating": <int> }`;

      let finalRating = { ...initialScore, timing: timingPoints };
      let pointsAwarded = 0;

      try {
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: evalPrompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        });

        let jsonText = "";
        if (typeof result.text === "function") jsonText = await result.text();
        else if (typeof result.text === "string") jsonText = result.text;
        else if (result?.response?.candidates?.[0]?.content?.parts?.[0]?.text)
          jsonText = result.response.candidates[0].content.parts[0].text;

        const aiRating = JSON.parse(jsonText.trim());
        let confidencePoints = rawConfidence >= 0.9 ? 5 : rawConfidence >= 0.7 ? 3 : rawConfidence > 0 ? 1 : 0;

        finalRating = {
          confidence: confidencePoints,
          englishSkill: aiRating.english_skill_rating,
          accuracy: aiRating.accuracy_rating,
          timing: timingPoints,
        };
        pointsAwarded = Object.values(finalRating).reduce((a, b) => a + b, 0);

        setCurrentRating(finalRating);
        setTotalScore((prev) => prev + pointsAwarded);
        addXP(pointsAwarded);
      } catch (err) {
        console.error(err);
        pointsAwarded = timingPoints + (rawConfidence > 0 ? 3 : 0);
        setCurrentRating({ ...initialScore, timing: timingPoints, confidence: rawConfidence > 0 ? 3 : 0 });
        setTotalScore((prev) => prev + pointsAwarded);
        addXP(pointsAwarded);
      }
    },
    [addXP, model]
  );

  // --- Speech Recognition ---
  const startListening = useCallback(() => {
    if (!SpeechRecognition) return alert("Browser does not support Speech Recognition");
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-INDIA";

    setUserAnswer("");
    setPenguinAnimation("idle"); // idle while user answers
    setTimer(30);

    let startTime = Date.now();

    recognition.onstart = () => {
      setRecognitionActive(true);
      timerRef.current = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            recognition.stop();
          }
          return t - 1;
        });
      }, 1000);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const confidence = event.results[0][0].confidence;
      const responseTime = (Date.now() - startTime) / 1000;

      setUserAnswer(transcript);
      setRecognitionActive(false);
      clearInterval(timerRef.current);

      evaluateAnswer(questions[currentQIndex], transcript, confidence, responseTime);
    };

    recognition.onend = () => {
      setRecognitionActive(false);
      clearInterval(timerRef.current);
      if (!userAnswer && currentQIndex > -1 && questions[currentQIndex])
        evaluateAnswer(questions[currentQIndex], "No audible response detected", 0, 0);
    };

    recognition.onerror = (e) => {
      console.error(e);
      setRecognitionActive(false);
      clearInterval(timerRef.current);
    };

    recognition.start();
  }, [currentQIndex, evaluateAnswer, questions, userAnswer]);

  // --- TTS ---
  const speakQuestion = useCallback(
    (question) => {
      if (!window.speechSynthesis) return;
      setPenguinAnimation("talking"); // Switch to talking
      const utterance = new SpeechSynthesisUtterance(question);
      utterance.lang = "en-US";
      utterance.rate = 0.9;

      utterance.onend = () => {
        setPenguinAnimation("idle"); // Back to idle
        setQuestionSpoken(true);
        startListening(); // Start user answer
      };

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    },
    [startListening]
  );

  // --- Generate Questions ---
  const generateQuestions = async () => {
    if (!role) return alert("Please enter a role!");
    setLoading(true);
    setQuestions([]);
    setInterviewActive(false);
    setCurrentQIndex(-1);
    setTotalScore(0);
    setCurrentRating(initialScore);
    setUserAnswer("");
    setQuestionSpoken(false); // Reset spoken state for new interview

    try {
      const prompt = `Generate 5 interview questions for a ${role}. 
List each question clearly, separated by a newline. 
Avoid explanations or numbering beyond 1–5.`;

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      let rawText = "";
      // Handle different SDK response structures gracefully
      if (typeof result.text === "function") {
        rawText = await result.text();
      } else if (typeof result.text === "string") {
        rawText = result.text;
      } else if (result?.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
        rawText = result.response.candidates[0].content.parts[0].text;
      }

      if (!rawText || rawText.trim().length === 0) {
        const blockReason = result?.response?.promptFeedback?.blockReason;
        const status = result?.response?.candidates?.[0]?.finishReason;
        throw new Error(
          `API call failed: No text received. Reason: ${blockReason || status || "Unknown API failure"}`
        );
      }

      const text = rawText.trim();
      const splitQuestions = text.split(/\n+/).filter((q) => q.trim() !== "");
      const finalQuestions = splitQuestions
        .slice(0, 5)
        .map((q) => q.replace(/^\d+[\).]?\s*/, "").trim());

      if (finalQuestions.length === 0) {
        throw new Error(
          "Gemini returned text, but it could not be parsed into valid questions."
        );
      }

      setQuestions(finalQuestions);
      setInterviewActive(true);
      setCurrentQIndex(0);
      addXP(20);
    } catch (err) {
      console.error("Gemini error:", err);
      alert(`Failed to generate questions. Error: ${err.message}. Please check console.`);
      setInterviewActive(false);
    }

    setLoading(false);
  };

 const nextQuestion = () => {
     if (currentQIndex < questions.length - 1) {
       setCurrentQIndex(prev => prev + 1);
       setCurrentRating(initialScore);
       setUserAnswer("");
       setQuestionSpoken(false); // Reset spoken state for the next question
     } else {
       alert(`Interview complete! Your final score is ${totalScore} points. Congratulations!`);
       setInterviewActive(false);
       setCurrentQIndex(-1); 
       if (window.speechSynthesis) window.speechSynthesis.cancel();
     }
   };
   
   // --- 🔄 Effect to Manage Question Speaking/Flow ---
   useEffect(() => {
     if (interviewActive && currentQIndex >= 0 && currentQIndex < questions.length) {
         // Only speak if the current question hasn't been evaluated AND hasn't been spoken yet
         if (currentRating.accuracy === 0 && !loading && !recognitionActive && !questionSpoken) {
             speakQuestion(questions[currentQIndex]);
         }
     }
   }, [currentQIndex, questions, interviewActive, speakQuestion, currentRating, loading, recognitionActive, questionSpoken]);
 
  return (
    <div className="mock-container">
      <div className="mock-split">
        {/* Left: Penguin */}
        <div className="penguin-canvas">
          <Canvas>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} />
            <Penguin animationState={penguinAnimation} />
            <OrbitControls enableZoom={false} />
          </Canvas>
        </div>

        {/* Right: Interview UI */}
        <div className="interview-ui">
          <h2>🎤 Mock Interview</h2>
          <p>Total Score: {totalScore}</p>

          {!interviewActive && (
            <div className="role-input">
              <input placeholder="Enter Role" value={role} onChange={(e) => setRole(e.target.value)} />
              <button onClick={generateQuestions}>Start</button>
            </div>
          )}

          {interviewActive && currentQIndex >= 0 && (
            <>
              <h3>
                Q{currentQIndex + 1}: {questions[currentQIndex]}
              </h3>
              <p>Timer: {timer}s</p>
              {recognitionActive && <p>🔴 Listening...</p>}
              {userAnswer && <p>Your Answer: {userAnswer}</p>}
              <button onClick={nextQuestion}>Next</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
