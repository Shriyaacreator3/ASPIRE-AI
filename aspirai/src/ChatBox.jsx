import React, { useState } from "react";
import { runGemini } from "./gemini";

export const  ChatBox=()=>{
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");

  const handleAsk = async () => {
    const reply = await runGemini(input);
    setResponse(reply);
  };

  return (
    <div>
      <h2>Gemini AI Chat</h2>
      <textarea 
        value={input} 
        onChange={(e) => setInput(e.target.value)} 
        placeholder="Ask Gemini something..." 
      />
      <br />
      <button onClick={handleAsk}>Ask</button>
      <p><strong>Gemini:</strong> {response}</p>
    </div>
  );
}

