import { BrowserRouter, Routes, Route } from "react-router-dom";
import {Login} from "./auth";
import { Signup} from "./Signup";
import {Home} from "./home";
import { Quizzes } from "./quizzes";
import { ProfileSetup} from "./profile";
import { ChatBox } from "./ChatBox";
import { Settings } from "./Settings";
import  Journal  from "./journal";
import  Entries  from "./journalEntries";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />  
        <Route path="/signup" element={<Signup />} /> 
        <Route path= "/profile" element={<ProfileSetup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/quizzes" element={<Quizzes/>} />
        <Route path="/chatbox" element={<ChatBox/>}/>
        <Route path="/settings" element={<Settings/>}/>
        <Route path="/journal" element={<Journal/>}/>
        <Route path="/entries" element={<Entries/>}/>
      </Routes>
    </BrowserRouter>
  );
}
