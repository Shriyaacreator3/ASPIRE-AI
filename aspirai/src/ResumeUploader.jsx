import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import * as mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";

// Use PDF.js worker from CDN to avoid 404
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const ResumeUploader = () => {
  const [resumeText, setResumeText] = useState("");
  const [role, setRole] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  // The useEffect that loaded the script has been removed.

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

  const sendToChatbase = () => {
    if (!resumeText || !role) {
      alert("Please upload a resume and enter a role");
      return;
    }
    // Check if the global chatbase object is available
    if (typeof window.chatbase !== "function") {
      alert("Chatbase widget is not ready. Please try again in a moment.");
      return;
    }

    setFeedback("");
    setLoading(true);

    const message = `User Role: ${role}\nResume:\n${resumeText}\nPlease analyze if the user is ready for this role or suggest improvements.`;

    try {
      // The sendMessage API may not be publicly documented for this use case.
      // This assumes the widget exposes this method globally.
      window.chatbase("sendMessage", {
        content: message,
      });

      // Since there's no official callback for programmatic sending in the embed,
      // you might need to listen for messages differently or use their API.
      // For now, let's assume you need to open the chat to see the result.
      // For this example, we'll just open the chatbot.
      window.chatbase("open");
      setFeedback("Your resume has been sent to the chatbot for analysis. Please check the chat window for feedback.");
      setLoading(false);

    } catch (err)
 {
      console.error(err);
      alert("Error sending message to Chatbase.");
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "30px auto", padding: "20px", border: "1px solid #ddd", borderRadius: "10px" }}>
      <h2>📄 Resume Checker</h2>

      <div
        {...getRootProps()}
        style={{
          border: "2px dashed #4CAF50",
          padding: "40px",
          textAlign: "center",
          cursor: "pointer",
          borderRadius: "10px",
          marginBottom: "20px",
          backgroundColor: isDragActive ? "#e8f5e9" : "#f9f9f9",
          color: "#333",
          fontWeight: "bold",
          fontSize: "16px",
        }}
      >
        <input {...getInputProps()} />
        {isDragActive ? <p>📂 Drop the file here...</p> : <p>📂 Drag & drop your PDF or DOCX file here, or click to select</p>}
      </div>

      {fileName && (
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
              fontSize: "14px",
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
        style={{ width: "100%", padding: "10px", marginBottom: "15px", borderRadius: "5px", border: "1px solid #ccc" }}
      />

      <button
        onClick={sendToChatbase}
        style={{ width: "100%", padding: "10px", backgroundColor: "#4CAF50", color: "#fff", fontSize: "16px", border: "none", borderRadius: "5px", cursor: "pointer" }}
        disabled={loading}
      >
        {loading ? "Processing..." : "Check Resume"}
      </button>

      {feedback && (
        <div style={{ marginTop: "20px", whiteSpace: "pre-wrap", padding: "15px", backgroundColor: "#f9f9f9", borderRadius: "5px", border: "1px solid #eee" }}>
          {feedback}
        </div>
      )}
    </div>
  );
};

export default ResumeUploader;