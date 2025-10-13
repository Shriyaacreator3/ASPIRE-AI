// src/ChatbaseGreeting.js
import { useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function ChatbaseGreeting() {
  useEffect(() => {
    const auth = getAuth();

    onAuthStateChanged(auth, (user) => {
      if (user) {
        const userName = user.displayName || "there";

        const hours = new Date().getHours();
        const greeting =
          hours < 12
            ? "Good morning"
            : hours < 18
            ? "Good afternoon"
            : "Good evening";

        // 🕒 Try every second for up to 10 seconds until chatbot loads
        let attempts = 0;
        const interval = setInterval(() => {
          const chatInput = document.querySelector(
            ".cb-chat-input textarea, .cb-chat-input input"
          );
          const sendButton = document.querySelector(".cb-chat-send-button");

          if (chatInput && sendButton) {
            chatInput.value = `${greeting}, ${userName}! How are you feeling today?`;
            const event = new Event("input", { bubbles: true });
            chatInput.dispatchEvent(event);
            sendButton.click();
            clearInterval(interval); // stop retrying once sent
          } else if (attempts++ > 10) {
            clearInterval(interval); // stop after ~10s
          }
        }, 1000);
      }
    });
  }, []);

  return null;
}
