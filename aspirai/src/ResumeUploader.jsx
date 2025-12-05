import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import * as mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "./ResumeUploader.css"; 
// Removed ReactMarkdown as we are using structured JSON rendering

// --- Icon Definitions (Simplified inline SVGs for compatibility) ---
const CheckIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-success"><path d="M20 6 9 17l-5-5"/></svg>
);
const XIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-error"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
);
const Chevron = ({ isOpen }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`chevron-icon ${isOpen ? 'is-open' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
);

// --- Circular Progress Bar Component (for Overall Score) ---
const getColor = (rating) => {
    if (rating >= 85) return "rgb(34, 197, 94)"; // green-500
    if (rating >= 60) return "rgb(234, 179, 8)"; // yellow-500
    return "rgb(239, 68, 68)"; // red-500
};

const CircularProgress = ({ percent, size = 120, strokeWidth = 10 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percent / 100) * circumference;
    const color = getColor(percent);

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="score-animation">
            {/* Background Circle */}
            <circle
                stroke="#e5e7eb" // gray-200
                fill="transparent"
                strokeWidth={strokeWidth}
                r={radius}
                cx={size / 2}
                cy={size / 2}
            />
            {/* Progress Arc */}
            <circle
                stroke={color}
                fill="transparent"
                strokeWidth={strokeWidth}
                r={radius}
                cx={size / 2}
                cy={size / 2}
                strokeDasharray={circumference + ' ' + circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{
                    transition: 'stroke-dashoffset 1.5s ease-out', // Animation
                    transform: 'rotate(-90deg)',
                    transformOrigin: '50% 50%',
                }}
            />
            {/* Text Percentage */}
            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" 
                  style={{ fontSize: size / 4, fontWeight: 'bold', fill: color }}>
                {percent}%
            </text>
        </svg>
    );
};

// --- JSON Schema (Same as before) ---
const reportSchema = {
  type: "OBJECT",
  properties: {
    overallRating: { type: "NUMBER", description: "Overall rating out of 100." },
    sections: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING", description: "Title of the section (e.g., 'ATS Check')." },
          rating: { type: "NUMBER", description: "Rating for this section out of 100." },
          subsections: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                title: { type: "STRING", description: "Title of the subsection (e.g., 'Spelling')." },
                hasIssue: { type: "BOOLEAN", description: "True if an issue was found, false otherwise." },
                detail: { 
                  type: "STRING", 
                  description: "Detailed finding. If 'Spelling' or 'Grammar' has an issue, format it strictly as: 'Original: [Mistake] | Correction: [Fix]'. Otherwise, provide a concise finding." 
                }
              },
              required: ["title", "hasIssue", "detail"]
            }
          }
        },
        required: ["title", "rating", "subsections"]
      }
    },
  },
  required: ["overallRating", "sections"]
};

// --- Helper Component for Subsections (Handles Detail Toggle) ---
const ReportSubSection = ({ sub, index }) => {
    const [showDetail, setShowDetail] = useState(false);

    // Only show the detail section if it exists OR if an issue was found
    const canToggle = sub.detail && (sub.hasIssue || sub.detail !== 'No issue found.');

    const isCorrection = sub.detail.includes('| Correction:');
    const [original, correction] = isCorrection 
        ? sub.detail.split('| Correction:').map(s => s.trim()) 
        : [null, null];

    const findingContent = isCorrection ? (
        <div className="correction-details-box">
            <p className="original-mistake">
                <span className="label-original">Original: </span>
                <span className="strikethrough-red">{original.replace('Original:', '').trim()}</span> 
            </p>
            <p className="suggested-correction">
                <span className="label-correction">Correction: </span>
                <span className="text-success">{correction}</span>
            </p>
        </div>
    ) : (
        <p className="finding-text detail-box-plain">
            {sub.detail}
        </p>
    );
    
    // Status text for the right side of the line
    const statusText = sub.hasIssue ? 'Show Issue' : 'No Issue';

    return (
        <div key={index} className="subsection-row-wrapper"> 
            {/* The entire button acts as the toggle */}
            <button
                className={`subsection-toggle-line ${canToggle ? 'is-clickable' : 'not-clickable'}`}
                onClick={() => canToggle && setShowDetail(!showDetail)}
                disabled={!canToggle}
            >
                {/* Left Side: Icon and Title */}
                <div className="status-title-group">
                    {sub.hasIssue ? <XIcon /> : <CheckIcon />}
                    <span className={sub.hasIssue ? 'text-red-strong font-medium' : 'text-gray-normal'}>
                        {sub.title}
                    </span>
                </div>
                {/* Right Side: Status and Chevron */}
                <div className="status-chevron-group">
                    <span className={`status-label ${sub.hasIssue ? 'text-error-strong' : 'text-success-strong'}`}>
                        {statusText}
                    </span>
                    {/* Only show chevron if content can be toggled */}
                    {canToggle && <Chevron isOpen={showDetail} />}
                </div>
            </button>
            
            {/* Hidden Content */}
            {(showDetail && canToggle) && (
                <div className="subsection-finding-content">
                    {findingContent}
                </div>
            )}
        </div>
    );
};

// --- Helper Component for Collapsible Sections ---
const ReportSection = ({ section, activeSection, setActiveSection }) => {
  const isOpen = activeSection === section.title;
  const issueCount = section.subsections.filter(sub => sub.hasIssue).length;
  const ratingColorClass = section.rating >= 85 ? 'text-success-strong' : section.rating >= 60 ? 'text-warning-strong' : 'text-error-strong';

  return (
    <div className="section-accordion-item-style">
      {/* Accordion Header - Combobox Kinda */}
      <button 
        className="accordion-header-style"
        onClick={() => setActiveSection(isOpen ? null : section.title)}
      >
        <div className="section-title-wrapper">
          <span className="section-title">{section.title}</span>
          <span className={`issue-badge-style ${issueCount > 0 ? 'bg-error-light text-error-strong' : 'bg-success-light text-success-strong'}`}>
            {issueCount} Issue{issueCount !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="section-rating-wrapper">
          <span className={`section-rating-percentage-style ${ratingColorClass}`}>
            {section.rating}%
          </span>
          <Chevron isOpen={isOpen} />
        </div>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="accordion-content-inner">
          {section.subsections.map((sub, index) => (
            <ReportSubSection key={index} sub={sub} index={index} />
          ))}
        </div>
      )}
    </div>
  );
};


pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

const ResumeUploader = () => {
  const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
  const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;
  
  const [report, setReport] = useState(null); 
  const [activeSection, setActiveSection] = useState(null); 

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
      setReport(null); 

      if (file.name.endsWith(".docx")) {
        const arrayBuffer = await file.arrayBuffer();
        const { value } = await mammoth.extractRawText({ arrayBuffer });
        setResumeText(value);
      } else if (file.name.endsWith(".pdf")) {
        const text = await parsePDF(file);
        setResumeText(text);
      } else {
        setFeedback("⚠️ Only PDF and DOCX files are supported");
      }
    } catch (err) {
      console.error(err);
      setFeedback("❌ Error parsing file: " + err.message);
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

    if (!API_KEY) {
      setFeedback("⚠️ Missing Gemini API Key. Please set it in your .env file.");
      return;
    }

    setFeedback("");
    setReport(null);
    setLoading(true);

    const MAX_LENGTH = 10000;
    const truncatedResume =
      resumeText.length > MAX_LENGTH
        ? resumeText.substring(0, MAX_LENGTH) +
          "\n\n... [Content Truncated for AI Analysis Limit]"
        : resumeText;

    // --- PROMPT: Requesting 5 Sections including 'Suggestions' ---
    const analysisPrompt = `
You are an expert career coach and resume analyst.
Analyze the following resume content for the job role of "${role}".
Your response MUST be a single JSON object conforming strictly to the provided schema.

RESUME CONTENT:
---
${truncatedResume}
---

Generate the analysis using the following five main sections and their subsections. Ensure ALL ratings are percentages (0-100).
1. ATS Check (Subsections: File size, File format, Design)
2. Readability (Subsections: Repetition, Spelling, Grammar)
3. Sections Check (Subsections: Education, Experience, Phone number, Email, LinkedIn)
4. Relevance (Subsections: Skills, Quantifiable Achievements)
5. Content (Subsections: General Content,Missing Skills)

For Spelling and Grammar, if 'hasIssue' is true, the 'detail' MUST be formatted as: 'Original: [Mistake] | Correction: [Fix]'.
`;
    
    const payload = {
        contents: [{ parts: [{ text: analysisPrompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: reportSchema,
        },
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`API returned status ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!jsonText) {
            throw new Error("Invalid response format from AI. Text content missing.");
        }

        const parsedReport = JSON.parse(jsonText);
        if (!parsedReport.overallRating || !parsedReport.sections) {
             throw new Error("AI response structure is incomplete.");
        }

        setReport(parsedReport);
        setFeedback("✅ Analysis complete! Review your structured report below.");
        
    } catch (err) {
        console.error("Gemini Analysis Error:", err);
        const message =
          err.message?.includes("403")
            ? "Invalid or unauthorized API key."
            : err.message?.includes("429")
            ? "API quota exceeded."
            : err.message || "Unknown error occurred (check console).";
        setFeedback(
          `❌ Error during AI evaluation: ${message}. Please check your API key or network connection.`
        );
    } finally {
        setLoading(false);
    }
  };

  const totalIssues = report ? report.sections.reduce((acc, sec) => acc + sec.subsections.filter(sub => sub.hasIssue).length, 0) : 0;

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
              setReport(null);
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
          !API_KEY
        }
        className={`analyze-btn ${loading ? "loading" : ""}`}
      >
        {loading ? "🔄 Analyzing Resume..." : "🚀 Get Analysis"}
      </button>

      {/* --- Structured Report Display --- */}
      {report && (
        <div className="structured-report-container">
          {/* Overall Score Card with Animated Circle */}
          <div className="overall-score-card">
            <h3 className="score-label">Overall Fit Score</h3>
            <CircularProgress percent={report.overallRating} size={150} strokeWidth={12} />
            <p className="issue-count">{totalIssues} Total Issue{totalIssues !== 1 ? 's' : ''}</p>
          </div>

          {/* Collapsible Sections */}
          <div className="report-sections-list">
            {report.sections.map((section) => (
              <ReportSection 
                key={section.title}
                section={section}
                activeSection={activeSection}
                setActiveSection={setActiveSection}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Fallback/Error Feedback */}
      {feedback && !report && (
        <div className={`feedback-box ${feedback.includes("❌") ? "error" : "success"}`}>
          <p>{feedback}</p> 
        </div>
      )}

    </div>
  );
};
export default ResumeUploader;