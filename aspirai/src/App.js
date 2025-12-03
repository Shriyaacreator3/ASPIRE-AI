import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Login } from "./auth";
import { Signup } from "./Signup";
import { Home } from "./home";
import { Quizzes } from "./quizzes";
import { ProfileSetup } from "./profile";
import { Settings } from "./Settings";
import Journal from "./journal";
import Entries from "./journalEntries";
import ChatbaseGreeting from "./ChatbaseGreeting";

import { MockInterview } from "./MockInterview";
import MoodTrends from "./MoodTrends";
import MiniLoFiPlayer from "./MiniLofiPlayer";
import { XPProvider } from "./XPContext";
import XPDisplay from "./XPDisplay";
import ResumeUploader from "./ResumeUploader";

export default function App() {
  return (
    <XPProvider>
        <BrowserRouter>
          <XPDisplay />
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<ProfileSetup />} />
            <Route path="/home" element={<Home />} />
            <Route path="/quizzes" element={<Quizzes />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/entries" element={<Entries />} />
            <Route path="/mood-trends" element={<MoodTrends />} />
            <Route path="/mock-interview" element={<MockInterview />} />
            <Route path="/lofi" element={<MiniLoFiPlayer />} />
            <Route path="/resume-checker" element={<ResumeUploader />} />
          </Routes>

          <ChatbaseGreeting /> {/* keep this */}
        </BrowserRouter>
    </XPProvider>
  );
}
