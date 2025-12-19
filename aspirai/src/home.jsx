import React, { useEffect } from "react";
import { useNavigate} from "react-router-dom";
import "./dashboard.css"; // Ensure you use the new CSS file
 
 
// Placeholder cat images - replace with your actual URLs!
const catImages = {
    quiz: '/images/cat-quiz.jpg',
    journal: '/images/cat-journal.jpg',
    mock: '/images/cat-mock.jpg',
    resume: '/images/cat-resume.jpg'
};

// Data structure for cards with new color classes - Settings card removed
const dashboardItems = [
    {
        title: "Quizzes",
        description: "Test your knowledge across various career topics and track your progress.",
        route: "/quizzes",
        className: "hquiz-card image-first", // Dark background, Image right
        imageSrc: catImages.quiz,
    },
    {
        title: "Journal Entry",
        description: "Reflect on your daily learning and career aspirations in your private log.",
        route: "/journal",
        className: "journal-card text-first", // White background, Image left
        imageSrc: catImages.journal,
    },
    {
        title: "Mock Interview",
        description: "Practice behavioral and technical questions with our AI interviewer.",
        route: "/mock-interview",
        className: "mock-card image-first", // White background, Image right
        imageSrc: catImages.mock,
    },
    {
        title: "Resume Checker",
        description: "Upload your resume for instant AI feedback and improvement suggestions.",
        route: "/resume-checker",
        className: "resume-card text-first", // Dark background, Image left
        imageSrc: catImages.resume,
    },
    
  
];

export function Home() {
    
    // Inside your functional component (e.g., Home or Navbar):
const navigate = useNavigate();
    // Scroll Reveal Animation (Intersection Observer)
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target); 
                    }
                });
            },
            {
                root: null,
                rootMargin: '0px 0px -100px 0px',
                threshold: 0.1
            }

        );

        const sections = document.querySelectorAll('.reveal');
        sections.forEach(section => {
            observer.observe(section);
        });

        return () => sections.forEach(section => observer.unobserve(section));
    }, []);


    return (
        <div className="home-container">

            <div className="main-content">

                <main className="dashboard">
                    

                    {dashboardItems.map((item, index) => (
                        <div
                            key={index}
                            className={`card-section reveal ${item.className}`}
                            onClick={() => navigate(item.route)}
                        >
                            <div className="card-text">
                                <h2 className="card-title">{item.title}</h2>
                                <p className="card-description">{item.description}</p>
                            </div>
                            <div className="card-image-container">
                                <img
                                    src={item.imageSrc}
                                    alt={`${item.title} icon cat`}
                                    className="cat-image"
                                    onError={(e) => { e.target.onerror = null; e.target.src="https://via.placeholder.com/150/2A3644/FFFFFF?text=CAT"; }} 
                                />
                            </div>
                        </div>
                    ))}
                </main>
                <div className="personality-promo-section reveal">
                    
                    {/* LEFT COLUMN: Large Pink Question */}
                    <div className="promo-left-text">
                        <h2 className="left-promo-title pink-text">
                            Ever wondered what makes you, <span className="underline-text">you</span>?
                        </h2>
                    </div>
                    
                    {/* CENTER COLUMN: Image */}
                    <div className="promo-center-image">
                        <img 
                            src="/images/cat-pquiz.jpg" 
                            alt="Excited cat holding a sign asking What's my Personality?"
                            className="promo-image"
                            onError={(e) => { e.target.onerror = null; e.target.src="https://via.placeholder.com/250/DF4C73/FFFFFF?text=Personality+Quiz"; }} 
                        />
                    </div>
                    
                    {/* RIGHT COLUMN: Gray Description and Button */}
                    <div className="promo-right-content">
                        <p className="right-promo-description">
                            Take this quick quiz to map your unique traits and discover your personality style.
                        </p>
                        <button 
                            className="promo-button" 
                            onClick={() => navigate('/personality-quiz')} // Navigate to the quiz page
                        >
                            Start Quiz
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}