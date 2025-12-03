import { useState, useEffect, useRef, Suspense } from "react";
import { Link } from "react-router-dom";
// 3D Imports
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { CloudStationModel } from "./Model"; 
import "./MiniLofiPlayer.css";

const songs = ["/audio/lofi1.mp3", "/audio/lofi2.mp3", "/audio/lofi3.mp3"];

const MiniLoFiPlayer = () => {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(new Audio(songs[0])); 

  useEffect(() => {
    
    const handleEnded = () => {
      setCurrentSongIndex((prev) => (prev + 1) % songs.length);
    };
    audioRef.current.removeEventListener("ended", handleEnded);
    audioRef.current.pause();
    audioRef.current = new Audio(songs[currentSongIndex]);

    audioRef.current.addEventListener("ended", handleEnded);

    if (isPlaying) {
      audioRef.current.play().catch(e => console.error("Error playing audio:", e));
    }
    return () => {
      audioRef.current.removeEventListener("ended", handleEnded);
      audioRef.current.pause();
    };
  }, [currentSongIndex, isPlaying]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } 
    setIsPlaying(!isPlaying);
  };

  const nextSong = () => {
    setCurrentSongIndex((prev) => (prev + 1) % songs.length);
  };

  const prevSong = () => {
    setCurrentSongIndex((prev) =>
      prev === 0 ? songs.length - 1 : prev - 1
    );
  };

  return (
    <div className="lofi-page-container">
    <Canvas 
    className="lofi-3d-canvas"
    camera={{ position: [0, 0, 20], fov: 50 }} 
>
    <Suspense fallback={null}> 
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Environment preset="sunset" background blur={0.5} /> 
        <CloudStationModel 
          position={[0, -4, 0]} 
          scale={5} 
        />
        <OrbitControls 
            enableZoom={true} 
            enablePan={false}
            autoRotate={true} 
            autoRotateSpeed={0.5}
            minDistance={20} 
            maxDistance={33} 
        />
    </Suspense>
</Canvas>
      <div className="ui-overlay">
        <div className="arrow-back">
          <Link to="/home" className="arrow-btn" aria-label="Back to home">⌂</Link>
        </div> 
        <div className="lofi-player">
          <div className="song-info">
            <p>Now Playing: Song {currentSongIndex + 1}</p>
          </div>
          <div className="player-controls">
            <button onClick={prevSong}>⏮</button>
            <button onClick={togglePlay}>{isPlaying ? "⏸" : "▶"}</button>
            <button onClick={nextSong}>⏭</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniLoFiPlayer;