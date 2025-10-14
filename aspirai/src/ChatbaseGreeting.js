import { useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

/**
 * A component that automatically sends a personalized greeting
 * to the Chatbase chatbot when a user is logged in.
 */
export default function ChatbaseGreeting() {
  useEffect(() => {
    const auth = getAuth();
    let intervalId = null; // To hold the interval ID for cleanup

    // Listen for changes in the user's authentication state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // If an interval is already running from a previous auth state, clear it.
      if (intervalId) {
        clearInterval(intervalId);
      }

      if (user) {
        // If the user is logged in, prepare the greeting message
        const userName = user.displayName || "there";

        const hours = new Date().getHours();
        const greeting =
          hours < 12
            ? "Good morning"
            : hours < 18
            ? "Good afternoon"
            : "Good evening";

        // This interval will try to find the chatbox elements and send the message.
        // It's necessary because the chatbot might take a moment to load onto the page.
        let attempts = 0;
        intervalId = setInterval(() => {
          // Wrap in a try-catch block to handle errors from interacting with third-party scripts.
          try {
            // Find the chat input and send button using their CSS selectors
            const chatInput = document.querySelector(
              ".cb-chat-input textarea, .cb-chat-input input"
            );
            const sendButton = document.querySelector(".cb-chat-send-button");

            if (chatInput && sendButton) {
              // If both elements are found, proceed to send the message
              chatInput.value = `${greeting}, ${userName}! How are you feeling today?`;
              
              // Dispatch an 'input' event to make sure any frameworks listening for changes see the new value
              const event = new Event("input", { bubbles: true });
              chatInput.dispatchEvent(event);
              
              // Programmatically click the send button
              sendButton.click();
              
              // Stop the interval since the message has been sent
              clearInterval(intervalId);
            } else if (attempts++ > 10) {
              // If the elements aren't found after 10 seconds, stop trying to prevent an infinite loop
              clearInterval(intervalId);
            }
          } catch (error) {
            console.error("Chatbase greeting error:", error);
            // If an error occurs (e.g., from the third-party script), stop the interval.
            clearInterval(intervalId);
          }
        }, 1000); // Check every second
      }
    });

    // Clean up the subscription and any running interval when the component is unmounted
    return () => {
      unsubscribe();
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []); // The empty array ensures this effect runs only once when the component mounts

  // This component does not render anything to the DOM
  return null;
}

