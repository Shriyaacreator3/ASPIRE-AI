import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import * as mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";

// Use CDN worker for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.js";

const ResumeUploader = () => {
  const [resumeText, setResumeText] = useState("");
  const [role, setRole] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [inputMode, setInputMode] = useState("upload");
  const [resumeChatbotReady, setResumeChatbotReady] = useState(false);

  // Check if Resume Chatbot is loaded
  useEffect(() => {
    const checkResumeChatbot = () => {
      if (window.resumeChatbase && typeof window.resumeChatbase === "function") {
        setResumeChatbotReady(true);
        console.log("✅ Resume Checker AI is ready!");
      } else {
        console.log("⏳ Waiting for Resume Checker AI...");
        setTimeout(checkResumeChatbot, 1000);
      }
    };

    setTimeout(checkResumeChatbot, 3000);
  }, []);

  // Function to parse PDFs
  const parsePDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item) => item.str).join(" ") + "\n";
    }
    return text;
  };

  // Dropzone logic
  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      setLoading(true);
      setFileName(file.name);

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
      alert("Error parsing file");
    } finally {
      setLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    multiple: false,
  });

  // Send to Resume Checker AI with better timing
  const sendToResumeChecker = async () => {
    if (!resumeText.trim() || !role.trim()) {
      alert("Please upload or type a resume and enter a role");
      return;
    }

    setFeedback("");
    setLoading(true);

    // Truncate resume text if it's too long (Chatbase has message limits)
    const truncatedResume = resumeText.length > 3000 
      ? resumeText.substring(0, 3000) + "... [truncated]"
      : resumeText;

    const message = `Please analyze this resume for the role of "${role}":

RESUME CONTENT:
${truncatedResume}

Provide specific feedback on:
- Strengths for this role
- Areas for improvement  
- Missing skills
- Tailoring suggestions`;

    try {
      if (window.resumeChatbase && typeof window.resumeChatbase === "function") {
        console.log("Opening Resume Checker AI...");
        
        // Close main chatbot first
        if (window.chatbase) {
          window.chatbase("close");
        }
        
        // Wait for close to complete
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Open resume checker
        window.resumeChatbase("open");
        
        console.log("Waiting for chat to fully open...");
        
        // Wait longer for chat to fully initialize
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log("Sending message to Resume AI...");
        
        // Send message - try different formats
        window.resumeChatbase("sendMessage", message);
        
        // Alternative: Try sending as user message
        setTimeout(() => {
          try {
            window.resumeChatbase("sendMessage", { content: message });
          } catch (e) {
            console.log("Alternative send failed:", e);
          }
        }, 500);
        
        setFeedback("✅ Resume sent to specialized Resume AI! The chat window opened and your resume should be analyzed shortly.");
        
      } else {
        throw new Error("Resume Checker AI not loaded yet");
      }
      
    } catch (err) {
      console.error("Resume Checker AI error:", err);
      setFeedback("❌ Error: " + err.message + ". Try the main AI below.");
    } finally {
      setLoading(false);
    }
  };

  // Alternative: Send to Main AI (more reliable)
  const sendToMainAI = async () => {
    if (!resumeText.trim() || !role.trim()) {
      alert("Please upload or type a resume and enter a role");
      return;
    }

    setFeedback("");
    setLoading(true);

    const truncatedResume = resumeText.length > 3000 
      ? resumeText.substring(0, 3000) + "... [truncated]"
      : resumeText;

    const message = `Analyze this resume for ${role} role:

${truncatedResume}

Give me specific feedback on strengths, weaknesses, and improvements needed.`;

    try {
      if (window.chatbase && typeof window.chatbase === "function") {
        console.log("Sending to Main AI...");
        
        // Close any existing chat
        window.chatbase("close");
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Open chat
        window.chatbase("open");
        
        // Wait for chat to open
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Send message
        window.chatbase("sendMessage", message);
        
        setFeedback("✅ Resume sent to AI! The chat window opened and your analysis should appear shortly.");
        
      } else {
        throw new Error("AI not available");
      }
    } catch (err) {
      console.error("Main AI error:", err);
      setFeedback("❌ Could not connect to AI. Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Direct approach - just open chat and let user copy-paste
  const openChatForManualPaste = () => {
    if (!resumeText.trim() || !role.trim()) {
      alert("Please upload or type a resume and enter a role");
      return;
    }

    const truncatedResume = resumeText.length > 2000 
      ? resumeText.substring(0, 2000) + "..."
      : resumeText;

    const messageToCopy = `Please analyze my resume for ${role} role:\n\n${truncatedResume}`;

    // Copy to clipboard
    navigator.clipboard.writeText(messageToCopy).then(() => {
      setFeedback("📋 Message copied to clipboard! The chat will open - please paste it manually and press enter.");
      
      // Open the chat after a delay
      setTimeout(() => {
        if (window.resumeChatbase) {
          window.resumeChatbase("open");
        } else if (window.chatbase) {
          window.chatbase("open");
        }
      }, 1000);
    }).catch(() => {
      // Fallback if clipboard fails
      setFeedback("💬 Chat opening! Please manually type: 'Analyze my resume for " + role + " role' and then paste your resume text.");
      
      setTimeout(() => {
        if (window.resumeChatbase) {
          window.resumeChatbase("open");
        } else if (window.chatbase) {
          window.chatbase("open");
        }
      }, 1000);
    });
  };

  return (
    <div style={{
      maxWidth: "600px",
      margin: "30px auto",
      padding: "20px",
      border: "1px solid #ddd",
      borderRadius: "10px",
      backgroundColor: "#fafafa"
    }}>
      <h2 style={{ textAlign: "center", color: "#333", marginBottom: "20px" }}>
        📄 Resume Checker
      </h2>

      {/* Resume Chatbot Status */}
      <div style={{ 
        marginBottom: "20px", 
        padding: "10px", 
        backgroundColor: resumeChatbotReady ? "#e8f5e9" : "#fff3cd",
        border: `2px solid ${resumeChatbotReady ? "#4CAF50" : "#ffc107"}`,
        borderRadius: "8px",
        textAlign: "center"
      }}>
        {resumeChatbotReady ? (
          <span style={{ color: "#4CAF50", fontWeight: "bold" }}>
            ✅ Specialized Resume AI Ready
          </span>
        ) : (
          <span style={{ color: "#856404" }}>
            ⏳ Loading Specialized Resume AI...
          </span>
        )}
      </div>

      {/* Mode Toggle */}
      <div style={{ marginBottom: "15px", textAlign: "center" }}>
        <button
          onClick={() => setInputMode("upload")}
          style={{
            backgroundColor: inputMode === "upload" ? "#4CAF50" : "#ddd",
            color: inputMode === "upload" ? "#fff" : "#333",
            padding: "8px 12px",
            border: "none",
            borderRadius: "5px",
            marginRight: "10px",
            cursor: "pointer"
          }}
        >
          Upload Resume
        </button>
        <button
          onClick={() => setInputMode("text")}
          style={{
            backgroundColor: inputMode === "text" ? "#4CAF50" : "#ddd",
            color: inputMode === "text" ? "#fff" : "#333",
            padding: "8px 12px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Enter as Text
        </button>
      </div>

      {/* Upload or Text Input */}
      {inputMode === "upload" ? (
        <div {...getRootProps()} style={{
          border: "2px dashed #4CAF50",
          padding: "40px",
          textAlign: "center",
          cursor: "pointer",
          borderRadius: "10px",
          marginBottom: "20px",
          backgroundColor: isDragActive ? "#e8f5e9" : "#f9f9f9",
          color: "#333",
          fontWeight: "bold",
          fontSize: "16px"
        }}>
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
          style={{
            width: "100%",
            height: "200px",
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            marginBottom: "15px",
            fontFamily: "inherit",
            fontSize: "14px",
            lineHeight: "1.5"
          }}
        />
      )}

      {fileName && inputMode === "upload" && (
        <div style={{ marginTop: "10px" }}>
          <p style={{ color: "#4CAF50", fontWeight: "bold" }}>✅ Uploaded: {fileName}</p>
          <button
            onClick={() => {
              setFileName("");
              setResumeText("");
              setFeedback("");
            }}
            style={{
              padding: "5px 10px",
              backgroundColor: "#f44336",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "14px"
            }}
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
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "15px",
          borderRadius: "5px",
          border: "1px solid #ccc"
        }}
      />

      {/* Buttons */}
      <button
        onClick={sendToResumeChecker}
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor: resumeChatbotReady ? "#4CAF50" : "#ccc",
          color: "#fff",
          fontSize: "16px",
          border: "none",
          borderRadius: "5px",
          cursor: resumeChatbotReady ? "pointer" : "not-allowed",
          marginBottom: "8px",
          fontWeight: "bold"
        }}
        disabled={loading || !resumeChatbotReady}
      >
        {loading ? "🔄 Processing..." : "🚀 Auto-Send to Resume AI"}
      </button>

      <button
        onClick={sendToMainAI}
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: "#2196F3",
          color: "#fff",
          fontSize: "14px",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginBottom: "8px"
        }}
        disabled={loading}
      >
        Auto-Send to Main AI
      </button>

      <button
        onClick={openChatForManualPaste}
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: "#FF9800",
          color: "#fff",
          fontSize: "14px",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
        disabled={loading}
      >
        📋 Copy & Open Chat (Most Reliable)
      </button>

      {feedback && (
        <div style={{
          marginTop: "20px",
          whiteSpace: "pre-wrap",
          padding: "15px",
          backgroundColor: feedback.includes("❌") ? "#ffebee" : 
                          feedback.includes("📋") ? "#e3f2fd" : "#e8f5e9",
          borderRadius: "5px",
          border: `1px solid ${feedback.includes("❌") ? "#f44336" : 
                    feedback.includes("📋") ? "#2196F3" : "#4CAF50"}`,
          fontSize: "14px",
          lineHeight: "1.4"
        }}>
          {feedback}
        </div>
      )}

      <div style={{ 
        marginTop: "15px", 
        fontSize: "12px", 
        color: "#666",
        textAlign: "center" 
      }}>
        <p>💡 <strong>Tip:</strong> Use the "Copy & Open Chat" option for most reliable results</p>
      </div>
    </div>
  );
};

export default ResumeUploader;