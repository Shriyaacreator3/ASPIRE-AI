import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import * as mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "./ResumeUploader.css"; // ✅ New CSS file
import ReactMarkdown from "react-markdown";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

const ResumeUploader = () => {
  const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const [resumeText, setResumeText] = useState("");
  const [role, setRole] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [inputMode, setInputMode] = useState("upload");

  const parsePDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item) => item.str).join(" ") + "\n";
    }
    return text;
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      setLoading(true);
      setFileName(file.name);
      setFeedback("");

      if (file.name.endsWith(".docx")) {
        const arrayBuffer = await file.arrayBuffer();
        const { value } = await mammoth.extractRawText({ arrayBuffer });
        setResumeText(value);
      } else if (file.name.endsWith(".pdf")) {
        const text = await parsePDF(file);
        setResumeText(text);
      } else {
        alert("Only PDF and DOCX files are supported");
      }
    } catch (err) {
      console.error(err);
      alert("Error parsing file: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    multiple: false,
  });

  const evaluateResume = async () => {
    if (!resumeText.trim() || !role.trim()) {
      setFeedback("🛑 Please upload or type a resume and enter a role.");
      return;
    }

    if (!process.env.REACT_APP_GEMINI_API_KEY) {
      setFeedback("⚠️ Missing Gemini API Key. Please set it in your .env file.");
      return;
    }

    setFeedback("");
    setLoading(true);

    const MAX_LENGTH = 10000;
    const truncatedResume =
      resumeText.length > MAX_LENGTH
        ? resumeText.substring(0, MAX_LENGTH) +
          "\n\n... [Content Truncated for AI Analysis Limit]"
        : resumeText;

    const analysisPrompt = `
You are an expert career coach and resume analyst.
Analyze the following resume content for the job role of "${role}".

RESUME CONTENT:
${truncatedResume}

Provide your feedback in a structured, professional format using **Markdown headings and bullet points**, focusing only on these four key areas:

## 🌟 Strengths for this Role
## 🎯 Areas for Improvement
## 🚫 Missing or Understated Skills
## ✂️ Tailoring Suggestions (1-2 sentences)
## 📊 Overall Resume Rating
- Provide an overall rating **as a percentage (0–100%)**, reflecting how well the resume fits the "${role}" position.
- Example: **Overall Rating: 82%**
`;

    try {
      const result = await model.generateContent({
  contents: [{ role: "user", parts: [{ text: analysisPrompt }] }],
});
      const aiAnalysis = result.response.text();

      if (!aiAnalysis || aiAnalysis.trim().length === 0) {
        throw new Error("Gemini returned an empty or invalid analysis.");
      }

      setFeedback(`\n${aiAnalysis.trim()}`);
    } catch (err) {
      console.error("Gemini Analysis Error:", err);
      const message =
        err.message?.includes("403")
          ? "Invalid or unauthorized API key."
          : err.message?.includes("429")
          ? "API quota exceeded."
          : err.message || "Unknown error occurred.";
      setFeedback(
        `❌ Error during AI evaluation: ${message}. Please check your API key, network connection, or try simplifying the resume text.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resume-container">
      <h2 className="resume-title">📄 Resume Checker</h2>

      <div
        className={`api-status ${
          process.env.REACT_APP_GEMINI_API_KEY ? "api-ok" : "api-missing"
        }`}
      >
      </div>

      <div className="mode-toggle">
        <button
          onClick={() => setInputMode("upload")}
          className={inputMode === "upload" ? "active" : ""}
        >
          Upload File
        </button>
        <button
          onClick={() => setInputMode("text")}
          className={inputMode === "text" ? "active" : ""}
        >
          Enter as Text
        </button>
      </div>

      {inputMode === "upload" ? (
        <div
          {...getRootProps({
            className: `dropzone ${isDragActive ? "active" : ""}`,
          })}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>📂 Drop the file here...</p>
          ) : (
            <p>📂 Drag & drop your PDF or DOCX file here, or click to select</p>
          )}
        </div>
      ) : (
        <textarea
          placeholder="Paste or type your resume here..."
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          className="resume-textarea"
        />
      )}

      {fileName && inputMode === "upload" && (
        <div className="file-info">
          <p>✅ Uploaded: {fileName}</p>
          <button
            onClick={() => {
              setFileName("");
              setResumeText("");
              setFeedback("");
            }}
            className="remove-file-btn"
          >
            Remove File
          </button>
        </div>
      )}

      <input
        type="text"
        placeholder="Enter your desired role (e.g., Software Developer)"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="role-input"
      />

      <button
        onClick={evaluateResume}
        disabled={
          loading ||
          !resumeText.trim() ||
          !role.trim() ||
          !process.env.REACT_APP_GEMINI_API_KEY
        }
        className={`analyze-btn ${loading ? "loading" : ""}`}
      >
        {loading ? "🔄 Analyzing Resume..." : "🚀 Get Analysis"}
      </button>

      {feedback && (
        <div className={`feedback-box ${feedback.includes("❌") ? "error" : "success"}`}>
          <ReactMarkdown>{feedback}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};
export default ResumeUploader;
